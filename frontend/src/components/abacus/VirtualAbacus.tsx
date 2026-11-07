import React, { useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

interface VirtualAbacusProps {
  initialRods?: number;
  interactive?: boolean;
  onValueChange?: (val: number) => void;
}

export default function VirtualAbacus({
  initialRods = 7,
  interactive = true,
  onValueChange,
}: VirtualAbacusProps) {
  // Rod state: each rod has upper bead (active: bool = value 5) and lower beads (count: 0 to 4 = value 1 each)
  const [rods, setRods] = useState<{ upper: boolean; lower: number }[]>(
    Array(initialRods).fill(null).map(() => ({ upper: false, lower: 0 }))
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play subtle sound or bead click
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 + Math.random() * 80, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  const calculateTotal = (currentRods = rods): number => {
    let total = 0;
    for (let i = 0; i < currentRods.length; i++) {
      const power = currentRods.length - 1 - i;
      const rodValue = (currentRods[i].upper ? 5 : 0) + currentRods[i].lower;
      total += rodValue * Math.pow(10, power);
    }
    return total;
  };

  const toggleUpper = (rodIdx: number) => {
    if (!interactive) return;
    playClickSound();
    setRods((prev) => {
      const updated = prev.map((rod, idx) =>
        idx === rodIdx ? { ...rod, upper: !rod.upper } : rod
      );
      if (onValueChange) onValueChange(calculateTotal(updated));
      return updated;
    });
  };

  const setLowerCount = (rodIdx: number, count: number) => {
    if (!interactive) return;
    playClickSound();
    setRods((prev) => {
      const updated = prev.map((rod, idx) => {
        if (idx !== rodIdx) return rod;
        // If clicking same count, toggle back down
        const newCount = rod.lower === count ? count - 1 : count;
        return { ...rod, lower: Math.max(0, newCount) };
      });
      if (onValueChange) onValueChange(calculateTotal(updated));
      return updated;
    });
  };

  const resetAbacus = () => {
    playClickSound();
    const clean = Array(initialRods).fill(null).map(() => ({ upper: false, lower: 0 }));
    setRods(clean);
    if (onValueChange) onValueChange(0);
  };

  const currentValue = calculateTotal();

  return (
    <div className="bg-gradient-to-b from-amber-50 to-amber-100/50 p-6 rounded-3xl border-4 border-amber-800 shadow-xl max-w-4xl mx-auto">
      {/* Top Bar with Value and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white/80 backdrop-blur px-5 py-3 rounded-2xl border border-amber-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-800 text-amber-100 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
            🧮
          </div>
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-amber-800">Current Value</p>
            <p className="text-3xl font-black font-mono text-navy-900 tracking-wider">
              {currentValue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 transition-all shadow-sm"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <Button
            variant="secondary"
            onClick={resetAbacus}
            className="border-amber-300 text-amber-900 hover:bg-amber-100/80 font-bold"
          >
            <RotateCcw size={16} /> Reset
          </Button>
        </div>
      </div>

      {/* Physical Abacus Frame (Soroban Style) */}
      <div className="relative bg-[#5c2e0b] p-5 rounded-2xl border-[6px] border-[#3b1d06] shadow-2xl overflow-x-auto">
        {/* Unit dots on beam indicator (middle rod has a unit dot) */}
        <div className="min-w-[500px]">
          {/* Upper Deck (Heaven Beads = value 5) */}
          <div className="h-28 relative flex justify-around px-4">
            {rods.map((rod, rIdx) => {
              const rodValue = (rod.upper ? 5 : 0) + rod.lower;
              return (
                <div key={`rod-top-${rIdx}`} className="relative flex flex-col items-center w-14">
                  {/* Vertical Wire Rod */}
                  <div className="absolute top-0 bottom-0 w-2 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 rounded-full shadow-inner z-0" />

                  {/* Heaven Bead (1 per rod) */}
                  <div
                    onClick={() => toggleUpper(rIdx)}
                    className={`z-10 w-11 h-7 rounded-[40%] transition-transform duration-200 cursor-pointer shadow-md flex items-center justify-center border-2 border-amber-900 ${
                      rod.upper
                        ? 'translate-y-16 bg-gradient-to-r from-red-600 via-red-500 to-red-700 ring-2 ring-red-300'
                        : 'translate-y-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:brightness-110'
                    }`}
                  >
                    <span className="text-[10px] font-black text-amber-100 select-none">5</span>
                  </div>

                  {/* Place value marker at top */}
                  <div className="absolute -top-3 text-[11px] font-mono font-bold text-amber-200">
                    10<sup>{rods.length - 1 - rIdx}</sup>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dividing Beam (Reckoning Beam) */}
          <div className="h-6 bg-[#2d1403] border-y-2 border-amber-600/40 relative flex justify-around items-center px-4 shadow-md z-20">
            {rods.map((_, rIdx) => {
              // Show unit reckoning dots at standard 3rd rod intervals
              const isUnitDot = (rods.length - 1 - rIdx) % 3 === 0;
              return (
                <div key={`dot-${rIdx}`} className="w-14 flex justify-center">
                  {isUnitDot && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-100 shadow-[0_0_6px_rgba(255,255,255,0.8)] border border-amber-900" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Lower Deck (Earth Beads = 4 beads of value 1) */}
          <div className="h-44 relative flex justify-around px-4 pt-2">
            {rods.map((rod, rIdx) => (
              <div key={`rod-bot-${rIdx}`} className="relative flex flex-col items-center w-14">
                {/* Vertical Wire Rod */}
                <div className="absolute top-0 bottom-0 w-2 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 rounded-full shadow-inner z-0" />

                {/* 4 Earth Beads */}
                <div className="z-10 w-full flex flex-col justify-start gap-1 h-full">
                  {[1, 2, 3, 4].map((beadNum) => {
                    const isActive = rod.lower >= beadNum;
                    return (
                      <div
                        key={`b-${rIdx}-${beadNum}`}
                        onClick={() => setLowerCount(rIdx, beadNum)}
                        className={`w-11 h-6 mx-auto rounded-[38%] transition-transform duration-200 cursor-pointer shadow-md flex items-center justify-center border-2 border-amber-900 ${
                          isActive
                            ? 'translate-y-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 ring-2 ring-emerald-300'
                            : 'translate-y-8 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:brightness-110'
                        }`}
                      >
                        <span className="text-[10px] font-black text-amber-100 select-none">1</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rod Place Values and Totals Display */}
      <div className="mt-4 grid grid-cols-7 gap-2 text-center">
        {rods.map((rod, idx) => {
          const val = (rod.upper ? 5 : 0) + rod.lower;
          return (
            <div key={`subval-${idx}`} className="bg-white/90 p-2 rounded-xl border border-amber-200">
              <span className="block text-[11px] text-gray-500 font-bold uppercase">
                Col {rods.length - idx}
              </span>
              <span className="text-lg font-black text-primary-700 font-mono">{val}</span>
            </div>
          );
        })}
      </div>

      {/* Helpful instruction guide */}
      <div className="mt-5 flex items-center gap-2 text-xs text-amber-900/80 bg-amber-200/50 p-3 rounded-xl border border-amber-300/60">
        <Sparkles size={16} className="text-amber-700 flex-shrink-0" />
        <span>
          <strong>How to use:</strong> Tap the upper red bead to add 5. Tap any lower green bead to activate 1s. Beads touching the center beam contribute to the calculated value.
        </span>
      </div>
    </div>
  );
}

