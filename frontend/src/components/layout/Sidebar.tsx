import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, User, BookOpen, Calculator, Zap,
  ClipboardList, Trophy, Medal, Users, Settings,
  LogOut, ChevronLeft, ChevronRight, Brain
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    to: '/student/dashboard',   icon: <LayoutDashboard size={18}/>, roles: ['student'] },
  { label: 'Dashboard',    to: '/teacher/dashboard',   icon: <LayoutDashboard size={18}/>, roles: ['teacher'] },
  { label: 'Dashboard',    to: '/admin/dashboard',     icon: <LayoutDashboard size={18}/>, roles: ['admin'] },
  { label: 'Dashboard',    to: '/organizer/dashboard', icon: <LayoutDashboard size={18}/>, roles: ['organizer'] },

  { label: 'My Profile',   to: '/student/profile',    icon: <User size={18}/>,          roles: ['student'] },
  { label: 'Syllabus',     to: '/student/syllabus',   icon: <BookOpen size={18}/>,      roles: ['student'] },
  { label: 'Practice',     to: '/student/practice',   icon: <Calculator size={18}/>,    roles: ['student'] },
  { label: 'Flash Anzan',  to: '/student/flash-anzan',icon: <Zap size={18}/>,           roles: ['student'] },
  { label: 'Mock Exams',   to: '/student/exams',      icon: <ClipboardList size={18}/>, roles: ['student'] },
  { label: 'My Results',   to: '/student/results',    icon: <Medal size={18}/>,         roles: ['student'] },
  { label: 'Competitions', to: '/student/competitions',icon: <Trophy size={18}/>,       roles: ['student'] },

  { label: 'My Students',  to: '/teacher/students',   icon: <Users size={18}/>,         roles: ['teacher'] },
  { label: 'User Management', to: '/admin/users',     icon: <Users size={18}/>,         roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors: Record<UserRole, string> = {
    student:   'bg-blue-500',
    teacher:   'bg-green-500',
    admin:     'bg-purple-500',
    organizer: 'bg-orange-500',
  };

  return (
    <aside
      className={clsx(
        'h-screen bg-navy-900 flex flex-col sticky top-0 transition-all duration-300 z-30 shadow-xl',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-primary-800/30">
        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Brain size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight">Brain Breakers</p>
            <p className="text-primary-300 text-xs">Academy</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-primary-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User chip */}
      {!collapsed && user && (
        <div className="mx-3 mt-4 mb-2 p-3 bg-primary-900/40 rounded-xl">
          <div className="flex items-center gap-2">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold', roleColors[user.role])}>
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-semibold truncate">{user.full_name}</p>
              <p className="text-primary-300 text-xs capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-primary-200 hover:bg-primary-800/60 hover:text-white',
                collapsed && 'justify-center'
              )
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-primary-800/30">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full',
            'text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

