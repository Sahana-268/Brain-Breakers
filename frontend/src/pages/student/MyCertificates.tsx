import React, { useEffect, useState } from 'react';
import { certificateApi } from '@/api/index';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Award, Printer, Lock, CheckCircle2, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface CertificateItem {
  id: number;
  cert_number: string;
  cert_type: string;
  issued_at: string;
  student_name: string;
  enrollment_number: string;
}

interface AchievementItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  is_unlocked: boolean;
  earned_at: string | null;
}

export default function MyCertificates() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      certificateApi.myCertificates(),
      certificateApi.myAchievements(),
    ]).then(([cRes, aRes]) => {
      setCertificates(cRes.data);
      setAchievements(aRes.data);
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-navy-900 flex items-center gap-2">
          <Award className="text-amber-500" /> Certificates & Achievements
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Official Brain Breakers Academy credentials, level graduations, and honor badges
        </p>
      </div>

      {/* Official Certificates Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-navy-900 flex items-center gap-2">
            <ShieldCheck className="text-primary-600" /> Official Diplomas & Certificates ({certificates.length})
          </h2>
        </div>

        {certificates.length === 0 ? (
          <Card className="p-10 text-center bg-white border border-primary-100 rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3 text-3xl">
              🎓
            </div>
            <h3 className="font-bold text-navy-900 text-base mb-1">No Certificates Issued Yet</h3>
            <p className="text-gray-500 text-xs max-w-md mx-auto">
              Complete Level examinations or place in abacus tournaments to earn official verified certificates signed by the Academy Academic Council.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <Card
                key={cert.id}
                className="p-6 bg-gradient-to-br from-white to-amber-50/40 border-2 border-amber-200/80 shadow-md rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
                      🏆
                    </span>
                    <Badge variant="yellow" className="uppercase font-bold tracking-wider">
                      {cert.cert_type.replace('_', ' ')}
                    </Badge>
                  </div>

                  <h3 className="font-extrabold text-navy-900 text-base mb-1">
                    Brain Breakers Diploma
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Awarded to <strong className="text-navy-900">{cert.student_name}</strong>
                  </p>

                  <div className="bg-white p-3 rounded-2xl border border-amber-100 text-xs space-y-1 mb-4 font-mono">
                    <div className="text-gray-500">
                      ID: <span className="font-bold text-navy-900">{cert.cert_number}</span>
                    </div>
                    <div className="text-gray-500">
                      Issued: {new Date(cert.issued_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <a
                  href={`/api/certificates/view/${cert.cert_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Printer size={15} /> View & Print Certificate <ExternalLink size={13} />
                </a>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Badges & Milestones Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-navy-900 flex items-center gap-2">
          <Sparkles className="text-orange-500" /> Milestones & Badges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <Card
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all flex items-start gap-3.5 ${
                ach.is_unlocked
                  ? 'bg-white border-primary-200 shadow-sm'
                  : 'bg-gray-50/70 border-gray-200/60 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  ach.is_unlocked ? 'bg-primary-50 ring-2 ring-primary-300' : 'bg-gray-200'
                }`}
              >
                {ach.is_unlocked ? ach.icon : <Lock size={20} className="text-gray-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="font-bold text-sm text-navy-900 truncate">{ach.name}</h4>
                  {ach.is_unlocked && (
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{ach.description}</p>
                {ach.is_unlocked && ach.earned_at ? (
                  <span className="text-[10px] text-primary-600 font-bold block">
                    Unlocked on {new Date(ach.earned_at).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold block">Locked Milestone</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
