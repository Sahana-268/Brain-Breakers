import React, { useEffect, useState } from 'react';
import { competitionApi } from '@/api/index';
import { Card, StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { Trophy, PlusCircle, Globe, MapPin, Calendar, Users, Award } from 'lucide-react';
import type { Competition } from '@/types';

export default function OrganizerDashboard() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [venue, setVenue] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [startDate, setStartDate] = useState('');
  const [prizeDetails, setPrizeDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCompetitions = () => {
    competitionApi.list().then((res) => {
      setCompetitions(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await competitionApi.create({
        title,
        description,
        is_online: isOnline,
        venue: isOnline ? null : venue,
        max_participants: maxParticipants,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        prize_details: prizeDetails,
      });
      toast.success('Competition created successfully! 🏆');
      setShowCreate(false);
      setTitle('');
      setDescription('');
      setVenue('');
      fetchCompetitions();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to create competition';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalParticipants = competitions.reduce((acc, c) => acc + (c.participant_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-2">
            <Trophy className="text-amber-500" /> Competition Organizer Suite
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Host online arithmetic tournaments or offline regional abacus championships
          </p>
        </div>

        <Button onClick={() => setShowCreate(!showCreate)} className="font-bold flex items-center gap-2">
          <PlusCircle size={18} /> {showCreate ? 'Close Form' : 'Host New Championship'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Events"
          value={competitions.length}
          icon={<Trophy size={24} className="text-amber-500" />}
          iconBg="bg-amber-100"
        />
        <StatCard
          title="Total Registrations"
          value={totalParticipants}
          icon={<Users size={24} className="text-primary-600" />}
          iconBg="bg-primary-100"
        />
        <StatCard
          title="Active Formats"
          value="Online & Offline"
          icon={<Globe size={24} className="text-green-600" />}
          iconBg="bg-green-100"
        />
      </div>

      {showCreate && (
        <Card className="p-6 bg-white border-2 border-primary-300 shadow-xl rounded-3xl animate-fade-in">
          <h2 className="text-lg font-black text-navy-900 mb-4">Create New Championship Event</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Competition Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Speed Abacus Cup 2026"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Event Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOnline(true)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      isOnline ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    🌐 Virtual / Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOnline(false)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      !isOnline ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    📍 Physical / Offline
                  </button>
                </div>
              </div>
            </div>

            {!isOnline && (
              <div>
                <label className="form-label">Physical Venue & City Address</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Auditorium Hall, City Center..."
                  className="form-input"
                  required={!isOnline}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Event Start Date</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Max Participants Capacity</label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 100)}
                  className="form-input"
                  min="5"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Prize & Awards Description</label>
              <input
                type="text"
                value={prizeDetails}
                onChange={(e) => setPrizeDetails(e.target.value)}
                placeholder="Gold/Silver/Bronze Medals, Certificates of Honor, Cash Prizes..."
                className="form-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} className="font-bold">
                Publish Competition
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Events Table */}
      <Card className="p-6 bg-white border border-primary-100 shadow-sm rounded-3xl">
        <h2 className="text-base font-bold text-navy-900 mb-4">Organized Competitions List</h2>

        {competitions.length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-sm">No competitions created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Format</th>
                  <th className="pb-3">Event Date</th>
                  <th className="pb-3">Enrolled</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {competitions.map((c) => (
                  <tr key={c.id} className="hover:bg-primary-50/50">
                    <td className="py-3.5 font-bold text-navy-900">{c.title}</td>
                    <td className="py-3.5">
                      <Badge variant={c.is_online ? 'blue' : 'purple'}>
                        {c.is_online ? 'Online' : 'Offline'}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-xs text-gray-500">
                      {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'TBA'}
                    </td>
                    <td className="py-3.5 font-mono text-xs text-navy-800 font-bold">
                      {c.participant_count} {c.max_participants ? `/ ${c.max_participants}` : ''}
                    </td>
                    <td className="py-3.5 text-right">
                      <Badge variant={c.status === 'registration_open' ? 'green' : 'yellow'}>
                        {c.status.replace('_', ' ').toUpperCase()}
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

