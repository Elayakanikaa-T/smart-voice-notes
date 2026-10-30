import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, BookOpen, Mic, FileText, Brain, FlaskConical,
  BarChart2, Bell, Lightbulb, Map, Globe, User, LogOut, ShieldCheck, ChevronLeft, ChevronRight, Users,
  Briefcase, Search, PlusCircle
} from 'lucide-react';
import { useState } from 'react';

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', labelKey: 'dashboard', end: true },
  { to: '/student/subjects', icon: BookOpen, label: 'Subjects', labelKey: 'subjects' },
  { to: '/student/record', icon: Mic, label: 'Record Audio', labelKey: 'record_audio' },
  { to: '/student/notes', icon: FileText, label: 'Notes', labelKey: 'notes' },
  { to: '/student/ai-guide', icon: Brain, label: 'AI Guide', labelKey: 'ai_guide' },
  { to: '/student/quiz', icon: FlaskConical, label: 'Quizzes', labelKey: 'quizzes' },
  { to: '/student/progress', icon: BarChart2, label: 'Progress', labelKey: 'progress' },
  { to: '/student/reminders', icon: Bell, label: 'Notifications', labelKey: 'notifications' },
  { to: '/student/recommendations', icon: Lightbulb, label: 'Recommendations', labelKey: 'recommendations' },
  { to: '/student/learning-path', icon: Map, label: 'Learning Path', labelKey: 'learning_path' },
  { to: '/profile', icon: User, label: 'Profile', labelKey: 'profile' },
];

const employeeLinks = [
  { to: '/meetings', icon: Briefcase, label: 'All Meetings', labelKey: 'meetings', end: true },
  { to: '/meetings/new', icon: PlusCircle, label: 'Record / New', labelKey: 'new_meeting' },
  { to: '/meeting-search', icon: Search, label: 'Search Archive', labelKey: 'search_meetings' },
  { to: '/profile', icon: User, label: 'Profile', labelKey: 'profile' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard', labelKey: 'dashboard', end: true },
  { to: '/admin/students', icon: Users, label: 'Manage Students', labelKey: 'students' },
  { to: '/admin/employees', icon: Briefcase, label: 'Manage Employees', labelKey: 'employees' },
  { to: '/admin/quizzes', icon: FlaskConical, label: 'Upload Quizzes (25Q)', labelKey: 'quizzes' },
  { to: '/admin/subjects', icon: BookOpen, label: 'Manage Subjects', labelKey: 'subjects' },
  { to: '/profile', icon: User, label: 'Profile', labelKey: 'profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'employee' ? employeeLinks : studentLinks;

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('preferred_language', lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`relative flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen`}>
      {/* Logo */}
      <div className={`flex h-16 items-center border-b border-slate-800 px-4 gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
          <Mic size={18} className="text-white" />
        </div>
        {!collapsed && <span className="font-bold text-white truncate">SmartVoiceNotes</span>}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600 transition-all"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* User badge - Clickable to go directly to Profile */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `m-3 rounded-xl p-3 flex items-center gap-3 border transition-all cursor-pointer group ${
            isActive
              ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700/60 hover:border-blue-500/40 text-slate-200'
          } ${collapsed ? 'justify-center p-2' : ''}`
        }
        title="View & Edit User Profile"
      >
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20 group-hover:ring-blue-400/40 transition-all">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        {!collapsed && (
          <div className="overflow-hidden flex-1 text-left">
            <p className="truncate text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
              {user?.name}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {user?.role === 'admin' ? (
                  <ShieldCheck size={10} className="text-emerald-400" />
                ) : (
                  <User size={10} className="text-blue-400" />
                )}
                <p className="text-xs capitalize text-slate-400">{user?.role}</p>
              </div>
              <span className="text-[10px] text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                Profile &rarr;
              </span>
            </div>
          </div>
        )}
      </NavLink>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {links.map(({ to, icon: Icon, labelKey, label, end }) => {
          const displayLabel = (t && t(labelKey) !== labelKey) ? t(labelKey) : (label || labelKey);
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''} ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
              title={collapsed ? displayLabel : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{displayLabel}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Language Switcher */}
      <div className="border-t border-slate-800 p-2 flex items-center justify-center gap-2">
        {!collapsed && <Globe size={14} className="text-slate-400" />}
        <select
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className={`bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 outline-none p-1 ${collapsed ? 'w-full text-center' : 'w-full'}`}
          title={t('select_language')}
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
      </div>

      {/* Logout */}
      <div className="border-t border-slate-800 p-2">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && t('logout')}
        </button>
      </div>
    </aside>
  );
}
