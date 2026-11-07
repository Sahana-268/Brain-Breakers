import React, { useEffect, useState } from 'react';
import { studentApi, usersApi } from '@/api/index';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Award, Calendar, ShieldCheck, HeartHandshake } from 'lucide-react';
import type { StudentProfile } from '@/types';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states for editable parent details
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    studentApi.getMyProfile().then((res) => {
      setProfile(res.data);
      setParentName(res.data.parent_name || '');
      setParentEmail(res.data.parent_email || '');
      setParentPhone(res.data.parent_phone || '');
      setPhone(res.data.phone || '');
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await usersApi.updateProfile({ phone });
      await usersApi.updateStudentProfile({
        parent_name: parentName,
        parent_email: parentEmail || null,
        parent_phone: parentPhone || null,
      });
      toast.success('Profile details updated successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to update';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Student Profile & Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Manage your student credentials and parent notification preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left ID Card Badge */}
        <Card className="p-6 bg-gradient-to-b from-primary-900 to-navy-900 text-white rounded-3xl shadow-xl flex flex-col justify-between items-center text-center">
          <div className="w-full flex justify-between items-center text-xs text-primary-200">
            <span>OFFICIAL ID</span>
            <Badge variant="blue" className="bg-primary-500 text-white">LEVEL {profile.current_level}</Badge>
          </div>

          <div className="my-6">
            <div className="w-24 h-24 rounded-full bg-primary-600 border-4 border-primary-400/40 mx-auto flex items-center justify-center text-3xl font-black text-white shadow-lg">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold mt-3 text-white">{profile.full_name}</h2>
            <p className="text-xs text-primary-300 font-mono mt-0.5">{profile.email}</p>
          </div>

          <div className="w-full bg-white/10 rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-primary-300 block">
              Enrollment Number
            </span>
            <span className="font-mono text-sm font-black tracking-widest text-accent-300">
              {profile.enrollment_number}
            </span>
          </div>
        </Card>

        {/* Right Details Form */}
        <Card className="md:col-span-2 p-6 bg-white border border-primary-100 shadow-sm rounded-3xl">
          <h3 className="font-bold text-navy-900 text-base mb-4 flex items-center gap-2">
            <HeartHandshake className="text-primary-600" /> Parent & Contact Information
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="form-label">Student Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="form-label">Parent / Guardian Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Parent's Name"
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Parent Email (For Progress Reports)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="form-input pl-10"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Evaluation summaries and monthly progress reports are emailed here.
              </p>
            </div>

            <div>
              <label className="form-label">Parent Emergency Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" loading={isUpdating} className="font-bold px-6">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

