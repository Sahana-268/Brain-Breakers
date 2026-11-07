import React, { useEffect, useState } from 'react';
import { competitionApi, leaderboardApi } from '@/api/index';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { Trophy, Calendar, MapPin, Users, Globe, Award, Medal, Sparkles } from 'lucide-react';
import type { Competition, LeaderboardEntry } from '@/types';

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'competitions' | 'leaderboard'>('competitions');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'offline'>('all');
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      competitionApi.list(),
      leaderboardApi.global(20),
    ]).then(([compRes, leadRes]) => {
      setCompetitions(compRes.data);
      setLeaderboard(leadRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleRegister = async (compId: number) => {
    setRegisteringId(compId);
    try {
      const res = await competitionApi.register(compId);
      toast.success(res.data.message || 'Successfully registered for competition!');
      // Update participant count in state
      setCompetitions((prev) =>
        prev.map((c) => (c.id === compId ? { ...c, participant_count: c.participant_count + 1 } : c))
      );
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed';
      toast.error(msg);
    } finally {
      setRegisteringId(null);
    }
  };

  const filteredCompetitions = competitions.filter((c) => {
    if (filterType === 'online') return c.is_online;
    if (filterType === 'offline') return !c.is_online;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-2">
            <Trophy className="text-amber-500" /> Abacus Competitions & Leaderboard
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Compete online or offline, earn trophies, and climb the ranks
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-primary-100/70 p-1 rounded-2xl border border-primary-200">
          <button
            onClick={() => setActiveTab('competitions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'competitions'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-primary-700 hover:text-navy-900'
            }`}
          >
            🏆 Tournaments ({competitions.length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-primary-700 hover:text-navy-900'
            }`}
          >
            🥇 Top Leaderboard
          </button>
        </div>
      </div>

      {/* COMPETITIONS TAB */}
      {activeTab === 'competitions' && (
        <div className="space-y-4">
          {/* Sub filter */}
          <div className="flex items-center gap-2">
            {(['all', 'online', 'offline'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterType === t
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-primary-100 hover:bg-primary-50'
                }`}
              >
                {t === 'all' ? 'All Competitions' : `${t} Events`}
              </button>
            ))}
          </div>

          {filteredCompetitions.length === 0 ? (
            <Card className="p-12 text-center bg-white border border-primary-100 rounded-3xl">
              <Trophy size={48} className="text-amber-300 mx-auto mb-3" />
              <p className="text-navy-900 font-bold">No {filterType !== 'all' ? filterType : ''} competitions scheduled yet.</p>
              <p className="text-xs text-gray-400 mt-1">Organizers and Admins announce new championships regularly.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitions.map((comp) => (
                <Card
                  key={comp.id}
                  className="p-6 bg-white border border-primary-100 shadow-sm flex flex-col justify-between rounded-3xl hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={comp.is_online ? 'blue' : 'purple'}>
                        {comp.is_online ? <span className="flex items-center gap-1"><Globe size={11} /> Online</span> : <span className="flex items-center gap-1"><MapPin size={11} /> Offline</span>}
                      </Badge>
                      <Badge variant={comp.status === 'registration_open' ? 'green' : 'yellow'}>
                        {comp.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <h3 className="font-extrabold text-navy-900 text-lg mb-2">{comp.title}</h3>

                    <div className="space-y-1.5 text-xs text-gray-500 mb-6">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-primary-500" />
                        <span>Starts: {comp.start_date ? new Date(comp.start_date).toLocaleDateString() : 'TBA'}</span>
                      </div>
                      {!comp.is_online && comp.venue && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-purple-500" />
                          <span className="truncate">{comp.venue}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-green-500" />
                        <span>Registered: <strong>{comp.participant_count}</strong> {comp.max_participants ? `/ ${comp.max_participants}` : ''}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRegister(comp.id)}
                    loading={registeringId === comp.id}
                    className="w-full font-bold shadow-sm"
                  >
                    Register for Championship
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <Card className="p-6 bg-white border border-primary-100 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-navy-900 flex items-center gap-2">
                <Sparkles className="text-amber-500" /> Global Hall of Fame
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Top-performing mental math champions across all levels</p>
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No students ranked on the leaderboard yet. Start taking exams to rank!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Enrollment</th>
                    <th className="pb-3 text-center">Level</th>
                    <th className="pb-3 text-center">Exams Taken</th>
                    <th className="pb-3 text-right pr-2">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaderboard.map((entry) => {
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;
                    return (
                      <tr key={entry.student_id} className="hover:bg-primary-50/50 transition-colors">
                        <td className="py-3.5 pl-2">
                          {isTop1 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-black text-xs inline-flex items-center justify-center">
                              🥇 1
                            </span>
                          ) : isTop2 ? (
                            <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black text-xs inline-flex items-center justify-center">
                              🥈 2
                            </span>
                          ) : isTop3 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-800 font-black text-xs inline-flex items-center justify-center">
                              🥉 3
                            </span>
                          ) : (
                            <span className="font-mono text-gray-400 font-bold ml-2">#{entry.rank}</span>
                          )}
                        </td>
                        <td className="py-3.5 font-bold text-navy-900">{entry.full_name}</td>
                        <td className="py-3.5 font-mono text-xs text-gray-500">{entry.enrollment_number}</td>
                        <td className="py-3.5 text-center">
                          <Badge variant="blue">L{entry.current_level}</Badge>
                        </td>
                        <td className="py-3.5 text-center font-mono text-gray-600">{entry.total_exams}</td>
                        <td className="py-3.5 text-right pr-2">
                          <span className="font-mono font-black text-primary-700 text-base">
                            {entry.avg_score}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

