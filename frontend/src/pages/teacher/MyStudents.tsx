import React, { useEffect, useState } from 'react';
import { studentApi } from '@/api/index';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { Users, Award, ChevronUp, Search, Eye, FileText } from 'lucide-react';

interface StudentItem {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  enrollment_number: string;
  current_level: number;
  parent_name?: string;
  parent_email?: string;
  is_active: boolean;
}

interface StudentProgress {
  student_id: number;
  full_name: string;
  current_level: number;
  total_exam_attempts: number;
  exams_passed: number;
  average_score: number;
  total_practice_sessions: number;
  total_practice_minutes: number;
}

export default function MyStudents() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProgress, setSelectedProgress] = useState<StudentProgress | null>(null);
  const [inspecting, setInspecting] = useState(false);

  const fetchStudents = () => {
    studentApi.listAll().then((res) => {
      setStudents(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handlePromoteLevel = async (studentId: number, currentLevel: number) => {
    if (currentLevel >= 8) {
      toast.error('Student is already at the highest Master Level 8!');
      return;
    }
    const nextLevel = currentLevel + 1;
    try {
      await studentApi.updateLevel(studentId, nextLevel);
      toast.success(`Promoted student to Level ${nextLevel}! 🎖️`);
      fetchStudents();
    } catch {
      toast.error('Failed to update student level');
    }
  };

  const handleViewProgress = async (studentId: number) => {
    setInspecting(true);
    try {
      const res = await studentApi.getProgress(studentId);
      setSelectedProgress(res.data);
    } catch {
      toast.error('Failed to load student progress');
    } finally {
      setInspecting(false);
    }
  };

  const filtered = students.filter((s) =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_number.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Student Roster & Progression</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Evaluate performance, promote abacus syllabus levels, and inspect learning reports
          </p>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student list */}
        <div className={selectedProgress ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <Card className="p-6 bg-white border border-primary-100 shadow-sm rounded-3xl">
            {filtered.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">No students match your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Enrollment</th>
                      <th className="pb-3 text-center">Level</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-primary-50/50">
                        <td className="py-3">
                          <p className="font-bold text-navy-900">{s.full_name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </td>
                        <td className="py-3 font-mono text-xs text-gray-600">{s.enrollment_number}</td>
                        <td className="py-3 text-center">
                          <Badge variant="blue">L{s.current_level}</Badge>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => handleViewProgress(s.id)}
                            className="p-1.5 text-primary-600 hover:bg-primary-100 rounded-lg transition-all"
                            title="View Progress Report"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handlePromoteLevel(s.id, s.current_level)}
                            className="px-2.5 py-1 text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-all"
                            title="Promote to Next Level"
                          >
                            Promote Level
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Selected Progress Report Drawer */}
        {selectedProgress && (
          <div className="lg:col-span-5">
            <Card className="p-6 bg-white border-2 border-primary-200 shadow-md rounded-3xl sticky top-24 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="green">Official Progress Card</Badge>
                <button
                  onClick={() => setSelectedProgress(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <h2 className="text-xl font-black text-navy-900">{selectedProgress.full_name}</h2>
              <p className="text-xs text-gray-500 mb-6">
                Current Abacus Rank: <strong>Level {selectedProgress.current_level}</strong>
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary-50 p-3.5 rounded-2xl">
                    <span className="text-[11px] text-gray-500 font-bold uppercase block">Exams Taken</span>
                    <span className="text-2xl font-black text-navy-900 font-mono">
                      {selectedProgress.total_exam_attempts}
                    </span>
                  </div>
                  <div className="bg-primary-50 p-3.5 rounded-2xl">
                    <span className="text-[11px] text-gray-500 font-bold uppercase block">Exams Passed</span>
                    <span className="text-2xl font-black text-green-600 font-mono">
                      {selectedProgress.exams_passed}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary-50 p-3.5 rounded-2xl">
                    <span className="text-[11px] text-gray-500 font-bold uppercase block">Average Score</span>
                    <span className="text-2xl font-black text-primary-700 font-mono">
                      {selectedProgress.average_score}%
                    </span>
                  </div>
                  <div className="bg-primary-50 p-3.5 rounded-2xl">
                    <span className="text-[11px] text-gray-500 font-bold uppercase block">Practice Time</span>
                    <span className="text-2xl font-black text-orange-600 font-mono">
                      {selectedProgress.total_practice_minutes}m
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <Button
                    onClick={() => {
                      toast.success(`Parent report generated for ${selectedProgress.full_name}`);
                    }}
                    className="w-full font-bold text-xs"
                  >
                    <FileText size={16} /> Send Report to Parent
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

