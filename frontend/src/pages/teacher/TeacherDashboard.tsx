import React, { useEffect, useState } from 'react';
import { studentApi, examApi } from '@/api/index';
import { StatCard, Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Users, BookOpen, PlusCircle, Award, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Record<string, unknown>[]>([]);
  const [exams, setExams] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateExam, setShowCreateExam] = useState(false);

  // New exam form state
  const [examTitle, setExamTitle] = useState('');
  const [duration, setDuration] = useState(20);
  const [totalMarks, setTotalMarks] = useState(50);
  const [questionsInput, setQuestionsInput] = useState('23 + 45\n67 - 19\n12 * 4\n81 / 9\n105 + 43');
  const [isCreating, setIsCreating] = useState(false);

  const loadData = () => {
    Promise.all([
      studentApi.listAll(),
      examApi.list(),
    ]).then(([sRes, eRes]) => {
      setStudents(sRes.data);
      setExams(eRes.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      toast.error('Please enter an exam title');
      return;
    }

    const lines = questionsInput.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      toast.error('Please provide at least one arithmetic question');
      return;
    }

    // Parse simple math questions (e.g. 23 + 45 or 12 * 4)
    const questions = lines.map((expr, idx) => {
      let ans = 0;
      try {
        // Safe evaluation of simple binary expressions: + - * /
        const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
        // Check simple math syntax
        if (/^[\d\s+\-*/.]+$/.test(sanitized)) {
          // eslint-disable-next-line no-eval
          ans = Function(`'use strict'; return (${sanitized})`)();
        }
      } catch {
        ans = 0;
      }
      return {
        question_text: expr,
        correct_answer: ans,
        marks: Math.max(1, Math.floor(totalMarks / lines.length)),
        order_index: idx,
      };
    });

    try {
      setIsCreating(true);
      await examApi.create({
        title: examTitle,
        duration_minutes: duration,
        total_marks: totalMarks,
        passing_marks: Math.round(totalMarks * 0.6),
        exam_type: 'mock',
        questions,
      });
      toast.success('Mock examination published successfully! 📝');
      setShowCreateExam(false);
      setExamTitle('');
      loadData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to create exam';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

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
          <h1 className="text-2xl font-black text-navy-900">Teacher Central Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Monitor student syllabus progression and manage assessments
          </p>
        </div>

        <Button onClick={() => setShowCreateExam(!showCreateExam)} className="font-bold flex items-center gap-2">
          <PlusCircle size={18} /> {showCreateExam ? 'Close Exam Builder' : 'Create New Assessment'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Students"
          value={students.length}
          icon={<Users size={24} className="text-primary-600" />}
          iconBg="bg-primary-100"
        />
        <StatCard
          title="Exams Published"
          value={exams.length}
          icon={<BookOpen size={24} className="text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Average Proficiency"
          value="Level 3.4"
          icon={<TrendingUp size={24} className="text-purple-600" />}
          iconBg="bg-purple-100"
        />
      </div>

      {/* Quick Exam Creator Drawer / Form */}
      {showCreateExam && (
        <Card className="p-6 bg-white border-2 border-primary-300 shadow-lg rounded-3xl animate-fade-in">
          <h2 className="text-lg font-black text-navy-900 mb-1">Assessment Creator (Fast Math Parser)</h2>
          <p className="text-xs text-gray-500 mb-4">
            Type one math problem per line (e.g. <code>45 + 55</code>, <code>14 * 3</code>, <code>120 / 4</code>). Answers evaluate automatically.
          </p>

          <form onSubmit={handleCreateExam} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Exam Title</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Level 2 Speed Addition Mock #1"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Duration (Minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                  className="form-input"
                  min="5"
                  max="120"
                />
              </div>
              <div>
                <label className="form-label">Total Marks</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(parseInt(e.target.value) || 50)}
                  className="form-input"
                  min="10"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Questions (One Arithmetic Expression per Line)</label>
              <textarea
                rows={5}
                value={questionsInput}
                onChange={(e) => setQuestionsInput(e.target.value)}
                className="form-input font-mono text-sm leading-relaxed"
                placeholder="25 + 45&#10;89 - 34&#10;12 * 6"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowCreateExam(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isCreating} className="font-bold">
                Publish Examination
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Students Quick Table */}
      <Card className="p-6 bg-white border border-primary-100 shadow-sm rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-navy-900">Enrolled Students Overview</h2>
          <Link to="/teacher/students" className="text-xs text-primary-600 font-bold hover:underline">
            Manage All Students →
          </Link>
        </div>

        {students.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No registered students found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Enrollment #</th>
                  <th className="pb-3">Current Level</th>
                  <th className="pb-3">Parent Contact</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.slice(0, 8).map((s) => (
                  <tr key={s.id as number} className="hover:bg-primary-50/50">
                    <td className="py-3 font-bold text-navy-900">{s.full_name as string}</td>
                    <td className="py-3 font-mono text-xs text-gray-500">{s.enrollment_number as string}</td>
                    <td className="py-3">
                      <Badge variant="blue">Level {s.current_level as number}</Badge>
                    </td>
                    <td className="py-3 text-xs text-gray-500">
                      {((s.parent_name as string) || (s.parent_email as string)) ? (
                        <span>{s.parent_name as string} ({s.parent_email as string})</span>
                      ) : (
                        <span className="text-gray-300">Not set</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant={s.is_active ? 'green' : 'red'}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

