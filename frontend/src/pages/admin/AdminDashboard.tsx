import React, { useEffect, useState } from 'react';
import { usersApi, studentApi, examApi, competitionApi } from '@/api/index';
import { StatCard, Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Users, BookOpen, Trophy, ShieldAlert, Settings, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: 0,
    studentsCount: 0,
    examsCount: 0,
    competitionsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersApi.listAll(),
      studentApi.listAll(),
      examApi.list(),
      competitionApi.list(),
    ]).then(([uRes, sRes, eRes, cRes]) => {
      setStats({
        usersCount: uRes.data.length,
        studentsCount: sRes.data.length,
        examsCount: eRes.data.length,
        competitionsCount: cRes.data.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">System Administration Console</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Overview of platform operations, access controls, and learning metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Accounts"
          value={stats.usersCount}
          icon={<Users size={24} className="text-primary-600" />}
          iconBg="bg-primary-100"
        />
        <StatCard
          title="Active Students"
          value={stats.studentsCount}
          icon={<Activity size={24} className="text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Exams in System"
          value={stats.examsCount}
          icon={<BookOpen size={24} className="text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Championships"
          value={stats.competitionsCount}
          icon={<Trophy size={24} className="text-amber-500" />}
          iconBg="bg-amber-100"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border border-primary-100 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy-900">User Management</h2>
            <Link to="/admin/users" className="text-xs text-primary-600 font-bold hover:underline">
              Open Directory →
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Review registered students, teachers, and organizers. Toggle user activation status or inspect authorization privileges.
          </p>
          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl text-sm hover:bg-primary-700 transition-all shadow-sm"
          >
            Manage User Accounts
          </Link>
        </Card>

        <Card className="p-6 bg-white border border-primary-100 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy-900">Abacus Syllabus Engine</h2>
            <Badge variant="green">Levels 1 – 8 Active</Badge>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Curriculum data is seeded with official 8-level progression: Single Digit, Two Digits, Multiplication, Division, and Flash Anzan.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={16} className="text-green-500" /> Database sync status: Operational
          </div>
        </Card>
      </div>
    </div>
  );
}

function ShieldCheck({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

