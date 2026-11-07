import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { studentApi, resultsApi, practiceApi } from '@/api/index';
import { StatCard } from '@/components/ui/Card';
import { BookOpen, Trophy, Zap, Target, Star, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Badge from '@/components/ui/Badge';
import { Link } from 'react-router-dom';

const LEVEL_COLORS = ['','bg-blue-400','bg-blue-500','bg-indigo-400','bg-indigo-500','bg-purple-400','bg-purple-500','bg-pink-500','bg-red-500'];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentApi.getMyProfile(),
      resultsApi.myResults(),
      practiceApi.mySessions(),
    ]).then(([p, r, s]) => {
      setProfile(p.data as Record<string, unknown>);
      setResults(r.data as Record<string, unknown>[]);
      setSessions(s.data as Record<string, unknown>[]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const level = (profile?.current_level as number) || 1;
  const totalExams = results.length;
  const passed = results.filter((r) => r.is_passed).length;
  const avgScore = totalExams ? Math.round(results.reduce((s, r) => s + (r.percentage as number), 0) / totalExams) : 0;
  const totalPractice = sessions.length;

  // Chart data: last 7 results
  const chartData = results.slice(0, 7).reverse().map((r, i) => ({
    name: `Exam ${i + 1}`,
    score: r.percentage,
  }));

  const QUICK_LINKS = [
    { to: '/student/practice', icon: '🧮', label: 'Practice Abacus', color: 'bg-blue-50 hover:bg-blue-100 border-blue-100' },
    { to: '/student/flash-anzan', icon: '⚡', label: 'Flash Anzan', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100' },
    { to: '/student/exams', icon: '📋', label: 'Take a Mock Exam', color: 'bg-green-50 hover:bg-green-100 border-green-100' },
    { to: '/student/competitions', icon: '🏆', label: 'Competitions', color: 'bg-purple-50 hover:bg-purple-100 border-purple-100' },
    { to: '/student/syllabus', icon: '📚', label: 'View Syllabus', color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100' },
    { to: '/student/results', icon: '📊', label: 'My Results', color: 'bg-pink-50 hover:bg-pink-100 border-pink-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">
            Hello, {(user?.full_name || '').split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's your learning overview today.</p>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-white ${LEVEL_COLORS[level]} shadow-sm`}>
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center font-bold">{level}</div>
          <div>
            <p className="text-xs font-medium text-white/80">Current Level</p>
            <p className="font-bold text-sm">Level {level}</p>
          </div>
        </div>
      </div>

      {/* Enrollment badge */}
      {Boolean(profile?.enrollment_number) && (
        <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-1.5">
          <Star size={14} className="text-primary-500" />
          <span className="text-xs font-semibold text-primary-700">
            Enrollment: {String(profile?.enrollment_number)}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Exams Taken" value={totalExams} icon={<BookOpen size={22} className="text-primary-600"/>} iconBg="bg-primary-100" />
        <StatCard title="Exams Passed" value={passed} icon={<Trophy size={22} className="text-green-600"/>} iconBg="bg-green-100" trend={totalExams ? `${Math.round(passed/totalExams*100)}% pass rate` : undefined} trendUp />
        <StatCard title="Avg Score" value={`${avgScore}%`} icon={<Target size={22} className="text-orange-500"/>} iconBg="bg-orange-100" />
        <StatCard title="Practice Sessions" value={totalPractice} icon={<Zap size={22} className="text-yellow-500"/>} iconBg="bg-yellow-100" />
      </div>

      {/* Chart + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-primary-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary-500"/>
            <h2 className="font-bold text-navy-800">Score Trend</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }}/>
                <Area type="monotone" dataKey="score" stroke="#3B82F6" fill="url(#scoreGrad)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
              Take some exams to see your score trend here!
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-5">
          <h2 className="font-bold text-navy-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LINKS.map((ql) => (
              <Link key={ql.to} to={ql.to}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all hover:scale-105 ${ql.color}`}>
                <span className="text-2xl">{ql.icon}</span>
                <span className="text-xs font-semibold text-navy-700 leading-tight">{ql.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-navy-800">Recent Results</h2>
            <Link to="/student/results" className="text-xs text-primary-600 font-medium hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {results.slice(0, 5).map((r) => (
              <div key={r.attempt_id as number} className="flex items-center gap-4 py-2 border-b border-primary-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${r.is_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {r.grade as string}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-800 truncate">{r.exam_title as string}</p>
                  <p className="text-xs text-gray-400">{new Date(r.submitted_at as string).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-navy-800">{r.percentage as number}%</p>
                  <Badge variant={r.is_passed ? 'green' : 'red'}>{r.is_passed ? 'Passed' : 'Failed'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

