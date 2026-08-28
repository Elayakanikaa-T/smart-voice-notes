import { Users, Settings, Book, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white shadow-xl">
        <div className="flex h-16 items-center justify-center border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-wider">ADMIN PANEL</h1>
        </div>
        <nav className="mt-8 space-y-2 px-4">
          <a href="#" className="flex items-center gap-3 rounded-lg bg-slate-700 px-4 py-3 font-medium transition-colors hover:bg-slate-600">
            <BarChart2 size={20} />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
            <Book size={20} />
            Manage Subjects
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
            <Users size={20} />
            Students
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
            <Settings size={20} />
            Settings
          </a>
        </nav>
        <div className="absolute bottom-8 w-64 px-4">
          <button onClick={() => navigate('/login')} className="w-full rounded-lg bg-red-500/20 px-4 py-2 text-red-400 transition-colors hover:bg-red-500 hover:text-white">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Overview</h2>
          <p className="text-gray-500">Welcome back, Administrator.</p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-800">1,248</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <Book size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Subjects</p>
                <p className="text-2xl font-bold text-gray-800">42</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
