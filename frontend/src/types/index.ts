// Core TypeScript types for Brain Breakers Academy

export type UserRole = 'student' | 'teacher' | 'admin' | 'organizer';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profile_photo?: string;
  is_active: boolean;
  created_at: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  enrollment_number: string;
  current_level: number;
  date_of_birth?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  full_name: string;
  email: string;
  phone?: string;
}

export interface SyllabusLevel {
  id: number;
  level_number: number;
  title: string;
  description: string;
  topics: string[];
  passing_marks: number;
  total_marks: number;
  duration_weeks: number;
}

export interface Exam {
  id: number;
  title: string;
  exam_type: 'mock' | 'level_test' | 'competition';
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  is_active: boolean;
  created_at: string;
  question_count: number;
}

export interface ExamDetail extends Exam {
  instructions?: string;
  questions: Question[];
}

export interface Question {
  id: number;
  question_text: string;
  marks: number;
  order_index: number;
  question_type: string;
}

export interface ExamResult {
  attempt_id: number;
  score: number;
  percentage: number;
  grade: string;
  is_passed: boolean;
  total_marks: number;
  correct_count: number;
  total_questions: number;
}

export interface Competition {
  id: number;
  title: string;
  comp_type: 'individual' | 'team';
  status: 'upcoming' | 'registration_open' | 'ongoing' | 'completed' | 'cancelled';
  is_online: boolean;
  start_date?: string;
  end_date?: string;
  registration_deadline?: string;
  max_participants?: number;
  participant_count: number;
  venue?: string;
}

export interface LeaderboardEntry {
  rank: number;
  student_id: number;
  full_name: string;
  enrollment_number: string;
  current_level: number;
  avg_score: number;
  total_exams: number;
}

export interface PracticeSession {
  id: number;
  practice_type: string;
  duration_seconds: number;
  problems_attempted: number;
  problems_correct: number;
  accuracy: number;
  session_date: string;
}

export interface AuthState {
  access_token: string;
  refresh_token: string;
  user: User;
}

