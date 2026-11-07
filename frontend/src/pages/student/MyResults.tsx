import React, { useEffect, useState } from 'react';
import { resultsApi } from '@/api/index';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Trophy, Calendar, CheckCircle, XCircle, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResultItem {
  attempt_id: number;
  exam_id: number;
  exam_title: string;
  score: number;
  percentage: number;
  grade: string;
  is_passed: boolean;
  submitted_at: string;
}

export default function MyResults() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resultsApi.myResults().then((res) => {
      setResults(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const passedCount = results.filter((r) => r.is_passed).length;
  const avg = results.length > 0 ? Math.round(results.reduce((a, b) => a + b.percentage, 0) / results.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900">My Exam Results & History</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Complete record of your mock examinations and official evaluations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-primary-100 shadow-sm text-xs">
            <span className="text-gray-400 font-bold block">PASS RATE</span>
            <span className="text-sm font-black text-green-600 font-mono">
              {results.length ? `${Math.round((passedCount / results.length) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-primary-100 shadow-sm text-xs">
            <span className="text-gray-400 font-bold block">AVERAGE</span>
            <span className="text-sm font-black text-primary-600 font-mono">{avg}%</span>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-primary-100 rounded-3xl">
          <p className="text-gray-500 font-medium">You haven't attempted any exams yet.</p>
          <p className="text-xs text-gray-400 mt-1">Take your first mock examination to view your score report here.</p>
          <Link
            to="/student/exams"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary-700 transition-all"
          >
            Browse Exams <ArrowRight size={16} />
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <Card
              key={r.attempt_id}
              className="p-5 bg-white border border-primary-100 shadow-sm hover:shadow-md transition-all flex flex-wrap items-center justify-between gap-4 rounded-2xl"
            >
              <div className="flex items-center gap-4 min-w-[240px]">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                    r.is_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {r.grade}
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-base">{r.exam_title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {new Date(r.submitted_at).toLocaleDateString()}
                    </span>
                    <span>·</span>
                    <span>Attempt #{r.attempt_id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs text-gray-400 block font-semibold">SCORE</span>
                  <span className="text-xl font-black text-navy-900 font-mono">
                    {r.percentage}%
                  </span>
                </div>

                <Badge variant={r.is_passed ? 'green' : 'red'}>
                  {r.is_passed ? 'PASSED' : 'NEEDS PRACTICE'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

