import React, { useState, useEffect } from 'react';
import VirtualAbacus from '@/components/abacus/VirtualAbacus';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { practiceApi } from '@/api/index';
import { Play, Check, RefreshCw, Trophy, Zap, Clock, Sparkles } from 'lucide-react';

type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';

export default function PracticePage() {
  const [operation, setOperation] = useState<OperationType>('addition');
  const [digits, setDigits] = useState<number>(1);
  const [currentProblem, setCurrentProblem] = useState<{ num1: number; num2: number; op: string; answer: number }>({
    num1: 4,
    num2: 3,
    op: '+',
    answer: 7,
  });
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [abacusSyncValue, setAbacusSyncValue] = useState<number>(0);
  const [useAbacusValue, setUseAbacusValue] = useState<boolean>(false);
  const [stats, setStats] = useState<{ attempted: number; correct: number; startTime: number }>({
    attempted: 0,
    correct: 0,
    startTime: Date.now(),
  });
  const [streak, setStreak] = useState<number>(0);
  const [showAbacus, setShowAbacus] = useState<boolean>(true);

  // Generate random problem based on operation & digits
  const generateProblem = (opType = operation, dig = digits) => {
    let min = 1;
    let max = 9;
    if (dig === 2) { min = 10; max = 99; }
    if (dig === 3) { min = 100; max = 999; }

    let n1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let n2 = Math.floor(Math.random() * (max - min + 1)) + min;
    let op = '+';
    let ans = n1 + n2;

    const chosenOp = opType === 'mixed'
      ? (['addition', 'subtraction', 'multiplication', 'division'] as OperationType[])[Math.floor(Math.random() * 4)]
      : opType;

    if (chosenOp === 'addition') {
      op = '+';
      ans = n1 + n2;
    } else if (chosenOp === 'subtraction') {
      op = '-';
      if (n1 < n2) [n1, n2] = [n2, n1]; // Avoid negatives for abacus students
      ans = n1 - n2;
    } else if (chosenOp === 'multiplication') {
      op = '×';
      // If 2 or 3 digits, limit multiplier to single digit for standard syllabus levels 3-4
      if (dig > 1) n2 = Math.floor(Math.random() * 8) + 2;
      ans = n1 * n2;
    } else if (chosenOp === 'division') {
      op = '÷';
      const divisor = Math.floor(Math.random() * 8) + 2;
      const quotient = Math.floor(Math.random() * (dig === 1 ? 9 : 20)) + 1;
      n1 = divisor * quotient;
      n2 = divisor;
      ans = quotient;
    }

    setCurrentProblem({ num1: n1, num2: n2, op, answer: ans });
    setUserAnswer('');
  };

  useEffect(() => {
    generateProblem(operation, digits);
  }, [operation, digits]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalAnswer = useAbacusValue ? abacusSyncValue : parseFloat(userAnswer);

    if (isNaN(finalAnswer)) {
      toast.error('Please enter an answer or use the virtual abacus!');
      return;
    }

    const isCorrect = Math.abs(finalAnswer - currentProblem.answer) < 0.001;
    const newAttempted = stats.attempted + 1;
    const newCorrect = stats.correct + (isCorrect ? 1 : 0);

    if (isCorrect) {
      toast.success('🎉 Fantastic! Correct answer!', { icon: '⭐' });
      setStreak((s) => s + 1);
    } else {
      toast.error(`Incorrect. Correct answer was ${currentProblem.answer}`);
      setStreak(0);
    }

    setStats({
      ...stats,
      attempted: newAttempted,
      correct: newCorrect,
    });

    // Automatically record session log every 5 questions
    if (newAttempted % 5 === 0) {
      const elapsed = Math.round((Date.now() - stats.startTime) / 1000);
      try {
        await practiceApi.logSession({
          practice_type: operation,
          duration_seconds: elapsed,
          problems_attempted: newAttempted,
          problems_correct: newCorrect,
        });
      } catch {
        // quiet error on autosave
      }
    }

    generateProblem();
  };

  const copyAbacusToInput = (val: number) => {
    setAbacusSyncValue(val);
    if (useAbacusValue) {
      setUserAnswer(val.toString());
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Options */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-2">
            <Zap className="text-primary-600" /> Abacus & Mental Math Practice
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Train your calculation speed with real-time feedback
          </p>
        </div>

        {/* Live Session Counter */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-primary-100 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-navy-800">
            <Trophy size={16} className="text-amber-500" />
            Score: <span className="text-primary-600 font-mono text-sm">{stats.correct}/{stats.attempted}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-navy-800">
            <Sparkles size={16} className="text-orange-500" />
            Streak: <span className="text-orange-600 font-mono text-sm">{streak} 🔥</span>
          </div>
        </div>
      </div>

      {/* Operation & Difficulty Tabs */}
      <Card className="p-4 bg-white border border-primary-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'addition', label: 'Addition (+)' },
              { id: 'subtraction', label: 'Subtraction (-)' },
              { id: 'multiplication', label: 'Multiplication (×)' },
              { id: 'division', label: 'Division (÷)' },
              { id: 'mixed', label: 'Mixed Mode 🎲' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setOperation(tab.id as OperationType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  operation === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-primary-50 text-navy-700 hover:bg-primary-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Digits:</span>
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => setDigits(d)}
                className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                  digits === d
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}D
              </button>
            ))}

            <button
              onClick={() => setShowAbacus(!showAbacus)}
              className="ml-3 text-xs font-semibold text-primary-700 underline hover:text-primary-900"
            >
              {showAbacus ? 'Hide Abacus' : 'Show Abacus'}
            </button>
          </div>
        </div>
      </Card>

      {/* Main Problem Interactive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 p-8 flex flex-col justify-between items-center text-center bg-gradient-to-br from-white via-primary-50/30 to-blue-50/40 border border-primary-200 shadow-md">
          <Badge variant="blue" className="mb-4 uppercase tracking-widest text-[10px]">
            Solve The Expression
          </Badge>

          {/* Large Problem Display */}
          <div className="my-6 bg-white px-8 py-6 rounded-3xl border-2 border-primary-200 shadow-inner w-full">
            <div className="flex items-center justify-center gap-4 text-5xl md:text-6xl font-black font-mono text-navy-900">
              <span>{currentProblem.num1}</span>
              <span className="text-primary-600">{currentProblem.op}</span>
              <span>{currentProblem.num2}</span>
            </div>
            <div className="mt-3 text-xs text-gray-400 font-semibold tracking-wider">
              = ?
            </div>
          </div>

          {/* Submission Input Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="flex items-center gap-2 justify-center mb-2">
              <label className="text-xs text-gray-600 font-semibold flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useAbacusValue}
                  onChange={(e) => {
                    setUseAbacusValue(e.target.checked);
                    if (e.target.checked) setUserAnswer(abacusSyncValue.toString());
                  }}
                  className="rounded text-primary-600 focus:ring-primary-400"
                />
                Use value from Virtual Abacus ({abacusSyncValue})
              </label>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                value={useAbacusValue ? abacusSyncValue : userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter result..."
                disabled={useAbacusValue}
                className="w-full text-center text-3xl font-black font-mono py-3 rounded-2xl border-2 border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-200 bg-white"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="lg" className="flex-1 font-bold text-base shadow-lg shadow-primary-200">
                <Check size={20} /> Submit Answer
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => generateProblem()}
                className="border-primary-200 text-gray-700"
                title="Skip problem"
              >
                <RefreshCw size={18} />
              </Button>
            </div>
          </form>
        </Card>

        {/* Virtual Abacus Helper Panel */}
        <div className={`lg:col-span-7 ${showAbacus ? 'block' : 'hidden lg:block'}`}>
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Visual Aid: Interactive Japanese Soroban
            </span>
            <span className="text-xs text-primary-600 font-medium">Click beads to calculate</span>
          </div>
          <VirtualAbacus
            initialRods={7}
            interactive={true}
            onValueChange={copyAbacusToInput}
          />
        </div>
      </div>
    </div>
  );
}

