import React, { useState, useEffect } from 'react';
import { examApi } from '@/api/index';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, AlertTriangle, Play, Award, ArrowLeft, ArrowRight, FileCheck } from 'lucide-react';
import type { Exam, ExamDetail, ExamResult } from '@/types';

export default function MockExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState<ExamDetail | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  // Load available exams
  useEffect(() => {
    examApi.list().then((res) => {
      setExams(res.data);
    }).finally(() => setLoading(false));
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!activeExam || timeLeft <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam, timeLeft, result]);

  const startExam = async (examId: number) => {
    try {
      setLoading(true);
      const [detailRes, attemptRes] = await Promise.all([
        examApi.get(examId),
        examApi.startAttempt(examId),
      ]);

      const examData = detailRes.data;
      if (!examData.questions || examData.questions.length === 0) {
        toast.error('This exam has no questions yet.');
        setLoading(false);
        return;
      }

      setActiveExam(examData);
      setAttemptId(attemptRes.data.attempt_id);
      setTimeLeft(examData.duration_minutes * 60);
      setCurrentQIndex(0);
      setAnswers({});
      setResult(null);
      toast.success(`Exam started! You have ${examData.duration_minutes} minutes.`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to start exam';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qId: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const submitExamAttempt = async () => {
    if (!activeExam || !attemptId) return;

    const formattedAnswers = activeExam.questions.map((q) => ({
      question_id: q.id,
      answer: answers[q.id] !== undefined && answers[q.id] !== '' ? parseFloat(answers[q.id]) : null,
    }));

    try {
      setIsSubmitting(true);
      const res = await examApi.submit(activeExam.id, attemptId, { answers: formattedAnswers });
      setResult(res.data);
      toast.success('Exam submitted and graded successfully! 🎓');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Submission error';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    toast.error('⏰ Time is up! Submitting answers automatically...', { duration: 6000 });
    submitExamAttempt();
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // RESULT SCREEN
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-6">
        <Card className="text-center p-8 bg-white border border-primary-100 shadow-xl rounded-3xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-50 flex items-center justify-center text-4xl mb-4">
            {result.is_passed ? '🏆' : '📝'}
          </div>
          <h2 className="text-2xl font-black text-navy-900">
            {result.is_passed ? 'Congratulations! You Passed!' : 'Exam Completed'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {result.is_passed
              ? 'Great performance on your mental mathematics exam!'
              : 'Keep practicing! You can retake this exam to improve your score.'}
          </p>

          <div className="grid grid-cols-3 gap-4 my-8">
            <div className="bg-primary-50 p-4 rounded-2xl">
              <span className="text-xs text-gray-500 font-bold block">Score</span>
              <span className="text-2xl font-black text-primary-700 font-mono">
                {result.score}/{result.total_marks}
              </span>
            </div>
            <div className="bg-primary-50 p-4 rounded-2xl">
              <span className="text-xs text-gray-500 font-bold block">Percentage</span>
              <span className="text-2xl font-black text-primary-700 font-mono">
                {result.percentage}%
              </span>
            </div>
            <div className="bg-primary-50 p-4 rounded-2xl">
              <span className="text-xs text-gray-500 font-bold block">Grade</span>
              <span className="text-2xl font-black text-primary-700 font-mono">
                {result.grade}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">Correct Answers:</span>
              <span className="font-bold text-green-600 font-mono">
                {result.correct_count} of {result.total_questions}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">Passing Status:</span>
              <Badge variant={result.is_passed ? 'green' : 'red'}>
                {result.is_passed ? 'PASSED' : 'NEEDS PRACTICE'}
              </Badge>
            </div>
          </div>

          <div className="mt-8 flex gap-3 justify-center">
            <Button
              onClick={() => {
                setActiveExam(null);
                setResult(null);
              }}
              size="lg"
              className="px-8"
            >
              Back to Available Exams
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ACTIVE EXAM TEST RUNNER
  if (activeExam) {
    const currentQ = activeExam.questions[currentQIndex];
    const totalQ = activeExam.questions.length;
    const answeredCount = Object.keys(answers).filter((k) => answers[Number(k)]?.trim()).length;

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Exam Header Banner */}
        <div className="bg-navy-900 text-white p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div>
            <h2 className="text-lg font-black">{activeExam.title}</h2>
            <p className="text-xs text-primary-200 mt-0.5">
              Question {currentQIndex + 1} of {totalQ} · {answeredCount} Answered
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-navy-800 px-4 py-2 rounded-xl border border-navy-700">
            <Clock size={18} className={timeLeft < 180 ? 'text-red-400 animate-pulse' : 'text-primary-300'} />
            <span className={`font-mono text-xl font-bold ${timeLeft < 180 ? 'text-red-400' : 'text-white'}`}>
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>

        {/* Question Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-8 p-6 flex flex-col justify-between min-h-[380px] bg-white border border-primary-100 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="blue">Question {currentQIndex + 1}</Badge>
                <span className="text-xs text-gray-500 font-semibold">{currentQ.marks} Marks</span>
              </div>

              {/* Question Text / Expression */}
              <div className="my-6 p-6 bg-primary-50/50 rounded-2xl border border-primary-100 text-center">
                <p className="text-3xl md:text-4xl font-black font-mono text-navy-900 tracking-wide">
                  {currentQ.question_text}
                </p>
              </div>

              {/* Answer Input */}
              <div className="max-w-xs mx-auto">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
                  Your Answer
                </label>
                <input
                  type="number"
                  step="any"
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                  placeholder="Enter answer..."
                  autoFocus
                  className="w-full text-center text-3xl font-mono font-black py-3 rounded-2xl border-2 border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-200"
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
              <Button
                variant="secondary"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
              >
                <ArrowLeft size={16} /> Previous
              </Button>

              {currentQIndex < totalQ - 1 ? (
                <Button onClick={() => setCurrentQIndex((i) => Math.min(totalQ - 1, i + 1))}>
                  Next <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  onClick={submitExamAttempt}
                  loading={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 font-bold"
                >
                  <FileCheck size={18} /> Finish & Submit Exam
                </Button>
              )}
            </div>
          </Card>

          {/* Quick Palette Overview */}
          <Card className="md:col-span-4 p-5 bg-white border border-primary-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-navy-900 text-sm mb-3">Questions Palette</h3>
              <div className="grid grid-cols-5 gap-2">
                {activeExam.questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                  const isCurrent = idx === currentQIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`h-10 rounded-xl text-xs font-black transition-all ${
                        isCurrent
                          ? 'ring-2 ring-primary-500 bg-primary-600 text-white'
                          : isAnswered
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Answered ({answeredCount})
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> Unanswered ({totalQ - answeredCount})
              </div>
              <Button
                variant="danger"
                onClick={submitExamAttempt}
                loading={isSubmitting}
                className="w-full mt-2 text-xs font-bold"
              >
                Submit Early
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // EXAMS LISTING VIEW
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Timed Mock Examinations</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Simulate official abacus competition conditions with auto-evaluation
        </p>
      </div>

      {exams.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-primary-100">
          <p className="text-gray-500 font-medium">No active examinations available right now.</p>
          <p className="text-xs text-gray-400 mt-1">Teachers and Admins can create exams from their dashboards.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              className="p-6 bg-white border border-primary-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={exam.exam_type === 'competition' ? 'purple' : 'blue'}>
                    {exam.exam_type.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={13} /> {exam.duration_minutes} mins
                  </span>
                </div>
                <h3 className="font-bold text-navy-900 text-lg mb-2">{exam.title}</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Total Marks: <strong>{exam.total_marks}</strong> · Passing: <strong>{exam.passing_marks}</strong>
                </p>
              </div>

              <Button
                onClick={() => startExam(exam.id)}
                className="w-full font-bold shadow-sm flex items-center justify-center gap-2"
              >
                <Play size={16} /> Start Examination
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

