import { useEffect, useState } from 'react';
import { syllabusApi } from '@/api/index';
import { Card } from '@/components/ui/Card';
import { CheckCircle, Clock, BookOpen } from 'lucide-react';
import type { SyllabusLevel } from '@/types';
import { useAuthStore } from '@/store/authStore';

const LEVEL_COLORS = ['','bg-blue-400','bg-blue-500','bg-indigo-400','bg-indigo-500','bg-purple-400','bg-purple-500','bg-pink-500','bg-red-500'];

export default function SyllabusPage() {
  const [levels, setLevels] = useState<SyllabusLevel[]>([]);
  const [selected, setSelected] = useState<SyllabusLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    syllabusApi.getAll().then((r) => {
      setLevels(r.data as SyllabusLevel[]);
      if (r.data.length > 0) setSelected(r.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"/></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">Abacus Syllabus</h1>
        <p className="text-gray-500 text-sm mt-1">8 progressive levels from beginner to grandmaster</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Level list */}
        <div className="space-y-2">
          {levels.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelected(l)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${selected?.id === l.id ? 'border-primary-500 bg-primary-50' : 'border-transparent bg-white hover:border-primary-200'} shadow-sm`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${LEVEL_COLORS[l.level_number]}`}>
                {l.level_number}
              </div>
              <div>
                <p className="font-semibold text-navy-800 text-sm">{l.title}</p>
                <p className="text-xs text-gray-400">{l.duration_weeks} weeks</p>
              </div>
            </button>
          ))}
        </div>

        {/* Level detail */}
        {selected && (
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0 ${LEVEL_COLORS[selected.level_number]}`}>
                  {selected.level_number}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy-900">Level {selected.level_number}: {selected.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">{selected.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={13}/> {selected.duration_weeks} weeks
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <CheckCircle size={13}/> Pass: {selected.passing_marks}/{selected.total_marks}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <BookOpen size={13}/> {selected.topics.length} topics
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-navy-800 mb-4">Topics Covered</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selected.topics.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-primary-50 rounded-xl">
                    <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-sm text-navy-700">{t}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Progress bar */}
            <Card>
              <h3 className="font-bold text-navy-800 mb-3">Passing Requirement</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${LEVEL_COLORS[selected.level_number]}`}
                    style={{ width: `${selected.passing_marks}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-navy-800">{selected.passing_marks}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Students must score at least {selected.passing_marks} out of {selected.total_marks} marks to pass Level {selected.level_number}.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

