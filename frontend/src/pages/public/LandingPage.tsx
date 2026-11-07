import { Link, useNavigate } from 'react-router-dom';
import { Zap, Trophy, Star, BookOpen, Users, ChevronRight, Calculator } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const FEATURES = [
  { icon: <Calculator size={28} className="text-primary-500"/>, title: 'Interactive Abacus', desc: 'Practice with a real virtual abacus – move beads, see values instantly.' },
  { icon: <Zap size={28} className="text-yellow-500"/>, title: 'Flash Anzan', desc: 'Ultra-fast number flashing to build lightning-speed mental calculation.' },
  { icon: <Trophy size={28} className="text-orange-500"/>, title: 'Competitions', desc: 'Join online and offline competitions. Earn medals and certificates.' },
  { icon: <BookOpen size={28} className="text-green-500"/>, title: 'Structured Syllabus', desc: '8 progressive levels from beginner single-digit to master mental abacus.' },
  { icon: <Star size={28} className="text-purple-500"/>, title: 'Achievements', desc: 'Unlock badges and certificates as you hit learning milestones.' },
  { icon: <Users size={28} className="text-blue-500"/>, title: 'Parent Reports', desc: 'Detailed progress reports sent to parents automatically.' },
];

const LEVELS = [1,2,3,4,5,6,7,8];
const LEVEL_COLORS = [
  'bg-blue-400','bg-blue-500','bg-indigo-400','bg-indigo-500',
  'bg-purple-400','bg-purple-500','bg-pink-500','bg-red-500'
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-primary-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Logo size="md" />

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2 font-bold shadow-md shadow-primary-200">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-primary-950 to-primary-800 text-white py-16 md:py-24 px-6 overflow-hidden relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur rounded-full px-4 py-1.5 text-xs font-bold text-accent-300 mb-6">
              <Zap size={14} className="text-yellow-400" /> Think Beyond, Learn Beyond
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
              Brain Breakers<br/>
              <span className="text-accent-400 font-extrabold">Academy</span>
            </h1>
            <p className="text-base sm:text-lg text-primary-100/90 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Build laser focus, razor-sharp photographic memory, and superhuman mental math skills through our interactive 8-level Abacus & Flash Anzan learning system.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-navy-950 font-black px-7 py-3.5 rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-orange-500/20"
              >
                Join Brain Breakers Free <ChevronRight size={18}/>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/20 transition-all"
              >
                Sign In to Portal
              </button>
            </div>
          </div>

          {/* Right Official Artwork Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-primary-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-40 transition-opacity" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 max-w-sm bg-white">
                <img
                  src="/hero-image.jpg"
                  alt="Brain Breakers Academy – Think Beyond, Learn Beyond"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary-600 py-6">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center text-white">
          {[['8 Levels', 'Beginner to Master'], ['4 Operations', 'Add · Sub · Mul · Div'], ['Online & Offline', 'Competitions']].map(([v,l]) => (
            <div key={v}>
              <p className="text-2xl font-extrabold">{v}</p>
              <p className="text-primary-200 text-sm">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-primary-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-3">Everything You Need</h2>
          <p className="text-gray-500 text-center mb-12">A complete learning ecosystem in one platform</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-bold text-navy-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy-900 mb-3">8 Progressive Levels</h2>
          <p className="text-gray-500 mb-12">From single-digit to full mental abacus mastery</p>
          <div className="flex flex-wrap justify-center gap-4">
            {LEVELS.map((l, i) => (
              <div key={l} className="flex flex-col items-center gap-2">
                <div className={`w-16 h-16 rounded-2xl ${LEVEL_COLORS[i]} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                  {l}
                </div>
                <span className="text-xs text-gray-500 font-medium">Level {l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-700 to-navy-900 py-16 px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
        <p className="text-primary-200 mb-8">Join thousands of students mastering mental mathematics</p>
        <button onClick={() => navigate('/register')} className="bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-all shadow-xl">
          Create Free Account →
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-primary-300 py-10 px-6 text-center text-sm">
        <div className="flex justify-center mb-3">
          <Logo size="sm" to="/" />
        </div>
        <p className="text-gray-400 text-xs">Think Beyond, Learn Beyond.</p>
        <p className="text-gray-500 text-xs mt-1">© 2026 Brain Breakers Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}

