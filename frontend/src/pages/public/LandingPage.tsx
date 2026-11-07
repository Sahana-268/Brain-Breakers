import { Link, useNavigate } from 'react-router-dom';
import { Brain, Zap, Trophy, Star, BookOpen, Users, ChevronRight, Calculator } from 'lucide-react';

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
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-primary-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <Brain size={18} className="text-white"/>
            </div>
            <span className="font-bold text-navy-900 text-sm">Brain Breakers Academy</span>
          </div>
          <div className="flex-1" />
          <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors">
            Log In
          </Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-primary-900 to-primary-700 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-400/30 rounded-full px-4 py-1.5 text-sm text-primary-200 mb-6">
            <Zap size={14}/> Think Beyond, Learn Beyond
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Master Abacus &<br/>
            <span className="text-accent-400">Mental Maths</span>
          </h1>
          <p className="text-lg text-primary-200 mb-10 max-w-2xl mx-auto">
            A complete learning platform for abacus education — from beginner to grandmaster.
            Practice, compete, and earn certificates with Brain Breakers Academy.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="flex items-center gap-2 bg-white text-primary-700 font-bold px-7 py-3.5 rounded-xl hover:bg-primary-50 transition-all shadow-lg shadow-primary-900/30">
              Start Learning Free <ChevronRight size={18}/>
            </button>
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 bg-primary-600/30 border border-primary-400/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-600/50 transition-all">
              I already have an account
            </button>
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
      <footer className="bg-navy-900 text-primary-300 py-8 px-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain size={16}/>
          <span className="font-semibold text-white">Brain Breakers Academy</span>
        </div>
        <p>© 2026 Brain Breakers Academy. Think Beyond, Learn Beyond.</p>
      </footer>
    </div>
  );
}

