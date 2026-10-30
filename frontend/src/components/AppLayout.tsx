import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Sparkles } from 'lucide-react';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar Header */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 capitalize flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-400" />
              {user?.role || 'User'} Portal
            </span>
            <ChevronRight size={12} className="text-slate-600 hidden sm:inline" />
            <span className="text-slate-400 hidden sm:inline">Smart Voice Notes AI</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Profile Link in Header */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 hover:border-blue-500/50 transition-all text-xs group cursor-pointer"
              title="Click to view & edit your user profile (name, password, status, age)"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[11px] shadow-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-semibold text-slate-200 group-hover:text-blue-300 leading-tight">
                  {user?.name || 'My Profile'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span className="capitalize">{user?.status || 'Active'}</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-400 group-hover:text-blue-300 ml-1">
                Profile &rarr;
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
