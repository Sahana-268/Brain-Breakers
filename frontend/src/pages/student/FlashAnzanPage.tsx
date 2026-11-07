import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { practiceApi } from '@/api/index';
import { Play, RotateCcw, Volume2, VolumeX, Zap, CheckCircle2, XCircle, Award } from 'lucide-react';

export default function FlashAnzanPage() {
  // Configuration
  const [digits, setDigits] = useState<number>(1);
  const [count, setCount] = useState<number>(5);
  const [speedMs, setSpeedMs] = useState<number>(800); // 0.8s per number
  const [includeNegative, setIncludeNegative] = useState<boolean>(false);
  const [sound, setSound] = useState<boolean>(true);

  // Game state
  const [status, setStatus] = useState<'idle' | 'countdown' | 'flashing' | 'input' | 'result'>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [correctSum, setCorrectSum] = useState<number>(0);
  const [history, setHistory] = useState<{ count: number; speed: number; correct: boolean }[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playBeep = (freq = 600, dur = 0.05) => {
    if (!sound) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {
      // AudioContext not available
    }
  };

  const startSession = () => {
    // Generate valid numbers series
    const generated: number[] = [];
    let runningSum = 0;
    const min = digits === 1 ? 1 : Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;

    for (let i = 0; i < count; i++) {
      let num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (includeNegative && i > 0 && Math.random() > 0.6 && runningSum - num > 0) {
        num = -num;
      }
      generated.push(num);
      runningSum += num;
    }

    setNumbers(generated);
    setCorrectSum(runningSum);
    setUserAnswer('');
    setStatus('countdown');
    setCountdown(3);
  };

  // Countdown 3, 2, 1, GO
  useEffect(() => {
    if (status !== 'countdown') return;
    if (countdown > 0) {
      playBeep(440, 0.08);
      const t = setTimeout(() => setCountdown((c) => c - 1), 800);
      return () => clearTimeout(t);
    } else {
      setStatus('flashing');
      setCurrentIndex(0);
    }
  }, [status, countdown]);

  // Number Flashing Cycle
  useEffect(() => {
    if (status !== 'flashing') return;

    if (currentIndex < numbers.length) {
      playBeep(700, 0.06);
      timerRef.current = setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, speedMs);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      // Finished showing numbers, ask for answer
      playBeep(880, 0.15);
      setStatus('input');
    }
  }, [status, currentIndex, numbers, speedMs]);

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ans = parseFloat(userAnswer);
    if (isNaN(ans)) {
      toast.error('Please input your calculated sum');
      return;
    }

    const isCorrect = ans === correctSum;
    setStatus('result');

    if (isCorrect) {
      toast.success('🎯 Outstanding! Pure Mental Math Mastery!');
      playBeep(980, 0.2);
    } else {
      toast.error(`Not quite right! The total was ${correctSum}`);
      playBeep(220, 0.3);
    }

    setHistory((prev) => [{ count, speed: speedMs, correct: isCorrect }, ...prev.slice(0, 9)]);

    // Log to API
    try {
      await practiceApi.logSession({
        practice_type: 'flash_anzan',
        duration_seconds: Math.round((count * speedMs) / 1000),
        problems_attempted: 1,
        problems_correct: isCorrect ? 1 : 0,
      });
    } catch {
      // quiet
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-2">
            <Zap className="text-yellow-500 fill-yellow-500" /> Flash Anzan (フラッシュ暗算)
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Train subconscious visualization and rapid mental arithmetic
          </p>
        </div>

        <button
          onClick={() => setSound(!sound)}
          className="p-2.5 rounded-xl border border-primary-200 bg-white hover:bg-primary-50 text-navy-800 flex items-center gap-2 text-xs font-bold"
        >
          {sound ? <Volume2 size={16} className="text-primary-600" /> : <VolumeX size={16} className="text-gray-400" />}
          Sound {sound ? 'On' : 'Off'}
        </button>
      </div>

      {/* Main Flash Display Screen */}
      <Card className="min-h-[380px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-navy-900 via-navy-800 to-primary-950 text-white rounded-3xl shadow-2xl relative overflow-hidden border-4 border-navy-700">
        {/* Status Background Glow */}
        <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />

        {status === 'idle' && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary-600/30 border border-primary-400/40 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner animate-pulse-soft">
              ⚡
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Ready for Flash Anzan?</h2>
              <p className="text-primary-200 text-sm max-w-sm mx-auto mt-1">
                {count} numbers will flash at {speedMs / 1000}s each. Add them mentally!
              </p>
            </div>
            <Button size="lg" onClick={startSession} className="bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-extrabold px-8 shadow-lg shadow-yellow-500/20">
              <Play size={20} className="fill-navy-900" /> Start Flash Sequence
            </Button>
          </div>
        )}

        {status === 'countdown' && (
          <div className="text-center animate-fade-in">
            <span className="text-8xl md:text-9xl font-black font-mono text-yellow-400 animate-bounce">
              {countdown === 0 ? 'GO!' : countdown}
            </span>
            <p className="text-xs uppercase tracking-widest text-primary-200 mt-4 font-bold">
              Focus your mind...
            </p>
          </div>
        )}

        {status === 'flashing' && (
          <div className="text-center animate-fade-in">
            <div className="text-7xl md:text-9xl font-black font-mono tracking-widest text-white drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]">
              {numbers[currentIndex] > 0 ? `+${numbers[currentIndex]}` : numbers[currentIndex]}
            </div>
            <div className="mt-8 flex items-center justify-center gap-1.5">
              {numbers.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-150 ${
                    i === currentIndex
                      ? 'w-8 bg-yellow-400'
                      : i < currentIndex
                      ? 'w-2 bg-primary-500'
                      : 'w-2 bg-navy-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {status === 'input' && (
          <form onSubmit={handleAnswerSubmit} className="text-center space-y-4 max-w-sm w-full animate-fade-in">
            <p className="text-primary-200 text-sm font-bold uppercase tracking-wider">
              Enter the Calculated Sum
            </p>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Total..."
              autoFocus
              className="w-full text-center text-5xl font-mono font-black py-3 rounded-2xl bg-white text-navy-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 border-2 border-yellow-400"
            />
            <div className="flex gap-2">
              <Button type="submit" size="lg" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-black">
                Verify Sum
              </Button>
              <Button type="button" variant="secondary" onClick={startSession} className="text-white bg-navy-700 hover:bg-navy-600 border-navy-600">
                <RotateCcw size={18} />
              </Button>
            </div>
          </form>
        )}

        {status === 'result' && (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg">
              {parseFloat(userAnswer) === correctSum ? (
                <CheckCircle2 size={48} className="text-green-400" />
              ) : (
                <XCircle size={48} className="text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-300">
                Your Answer: <strong className="text-white font-mono">{userAnswer}</strong>
              </p>
              <p className="text-3xl font-black text-white mt-1">
                Correct Sum: <span className="text-yellow-400 font-mono">{correctSum}</span>
              </p>
              <p className="text-xs text-primary-200 mt-2 font-mono">
                Formula: {numbers.map((n) => (n > 0 ? `+${n}` : n)).join(' ')} = {correctSum}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button onClick={startSession} className="bg-yellow-500 hover:bg-yellow-400 text-navy-900 font-bold px-6">
                Try Next Flash Round
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Controls & Configuration Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Digits selection */}
        <Card className="p-4 bg-white border border-primary-100">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
            Number of Digits
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                disabled={status === 'flashing' || status === 'countdown'}
                onClick={() => setDigits(d)}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  digits === d
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-primary-50 text-navy-800 hover:bg-primary-100'
                }`}
              >
                {d} {d === 1 ? 'Digit' : 'Digits'}
              </button>
            ))}
          </div>
        </Card>

        {/* Count selection */}
        <Card className="p-4 bg-white border border-primary-100">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
            Numbers in Sequence
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[3, 5, 10, 15].map((c) => (
              <button
                key={c}
                disabled={status === 'flashing' || status === 'countdown'}
                onClick={() => setCount(c)}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  count === c
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-primary-50 text-navy-800 hover:bg-primary-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Card>

        {/* Speed selection */}
        <Card className="p-4 bg-white border border-primary-100">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
            Flash Speed
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { ms: 1200, label: '1.2s' },
              { ms: 800, label: '0.8s' },
              { ms: 500, label: '0.5s' },
              { ms: 300, label: '0.3s' },
              { ms: 200, label: '0.2s ⚡' },
              { ms: 100, label: '0.1s 🚀' },
            ].map((s) => (
              <button
                key={s.ms}
                disabled={status === 'flashing' || status === 'countdown'}
                onClick={() => setSpeedMs(s.ms)}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                  speedMs === s.ms
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent history log */}
      {history.length > 0 && (
        <Card className="p-4 bg-white border border-primary-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Recent Flash Anzan Trials
          </h3>
          <div className="flex flex-wrap gap-2">
            {history.map((h, idx) => (
              <Badge key={idx} variant={h.correct ? 'green' : 'red'}>
                {h.correct ? '✓' : '✗'} {h.count} nums @ {h.speed / 1000}s
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

