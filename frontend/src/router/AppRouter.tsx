import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { useAuthStore } from '@/store/authStore';

// Public pages
import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';

// Student pages
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentProfile from '@/pages/student/StudentProfile';
import SyllabusPage from '@/pages/student/SyllabusPage';
import PracticePage from '@/pages/student/PracticePage';
import FlashAnzanPage from '@/pages/student/FlashAnzanPage';
import MockExamPage from '@/pages/student/MockExamPage';
import MyResults from '@/pages/student/MyResults';
import CompetitionsPage from '@/pages/student/CompetitionsPage';
import MyCertificates from '@/pages/student/MyCertificates';

// Teacher pages
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import MyStudents from '@/pages/teacher/MyStudents';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';

// Organizer pages
import OrganizerDashboard from '@/pages/organizer/OrganizerDashboard';

// Shared layout
import DashboardLayout from '@/components/layout/DashboardLayout';

function RoleRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  const redirects: Record<string, string> = {
    student: '/student/dashboard',
    teacher: '/teacher/dashboard',
    admin: '/admin/dashboard',
    organizer: '/organizer/dashboard',
  };
  return <Navigate to={redirects[user.role] || '/login'} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* Student routes */}
        <Route element={<PrivateRoute allowedRoles={['student']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/syllabus" element={<SyllabusPage />} />
            <Route path="/student/practice" element={<PracticePage />} />
            <Route path="/student/flash-anzan" element={<FlashAnzanPage />} />
            <Route path="/student/exams" element={<MockExamPage />} />
            <Route path="/student/results" element={<MyResults />} />
            <Route path="/student/competitions" element={<CompetitionsPage />} />
            <Route path="/student/certificates" element={<MyCertificates />} />
          </Route>
        </Route>

        {/* Teacher routes */}
        <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/students" element={<MyStudents />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>
        </Route>

        {/* Organizer routes */}
        <Route element={<PrivateRoute allowedRoles={['organizer', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-navy-900 mb-2">Access Denied</h1>
              <p className="text-gray-500 mb-6">You don't have permission to view this page.</p>
              <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

