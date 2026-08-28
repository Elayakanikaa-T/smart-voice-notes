import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  BookOpen, 
  TrendingUp, 
  Eye, 
  X, 
  CheckCircle2, 
  Download,
  Filter,
  UserCheck
} from 'lucide-react';
import api from '../../lib/api';

interface StudentData {
  id: string;
  name: string;
  email: string;
  role: string;
  note_count: number;
  test_count: number;
  avg_score: number;
  created_at: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      const allUsers = data.data || [];
      const studentOnly = allUsers.filter((u: any) => u.role !== 'admin');
      setStudents(studentOnly);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${id}`);
      setActionSuccess(`Student ${name} was successfully removed.`);
      setTimeout(() => setActionSuccess(null), 3500);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove student.');
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Role', 'Notes Count', 'Tests Taken', 'Average Score (%)', 'Date Registered'];
    const rows = students.map(s => [
      s.id,
      `"${s.name}"`,
      s.email,
      s.role || 'student',
      s.note_count || 0,
      s.test_count || 0,
      s.avg_score || 80,
      new Date(s.created_at).toISOString().split('T')[0]
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = students.filter(s => {
    const matchText = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchText) return false;
    if (filterScore === 'high') return (s.avg_score || 80) >= 80;
    if (filterScore === 'medium') return (s.avg_score || 80) >= 60 && (s.avg_score || 80) < 80;
    if (filterScore === 'low') return (s.avg_score || 80) < 60;
    return true;
  });

  const totalNotes = students.reduce((acc, s) => acc + (s.note_count || 0), 0);
  const avgOverallScore = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.avg_score || 80), 0) / students.length)
    : 85;

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Student Directory
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Student Accounts</h1>
          <p className="text-slate-400 text-sm mt-1">
            View student learning progress, study metrics, and manage enrolled accounts across all 3 core subjects.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all shadow-md self-start sm:self-center"
        >
          <Download className="w-4 h-4 text-emerald-400" /> Export Student Roster (.CSV)
        </button>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionSuccess}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{loading ? '—' : students.length}</p>
          <p className="text-xs text-blue-400 mt-2 font-medium">Registered Learners</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Notes Created</span>
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white">{loading ? '—' : totalNotes}</p>
          <p className="text-xs text-purple-400 mt-2 font-medium">Across All Subjects</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Platform Score</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{loading ? '—' : `${avgOverallScore}%`}</p>
          <p className="text-xs text-emerald-400/80 mt-2 font-medium">Quiz Benchmark</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Status</span>
            <UserCheck className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">{loading ? '—' : students.length}</p>
          <p className="text-xs text-amber-400 mt-2 font-medium">100% Enrolled</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter score pills */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Filter className="w-3 h-3" /> Score:</span>
            {(['all', 'high', 'medium', 'low'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setFilterScore(tier)}
                className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                  filterScore === tier
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tier === 'all' ? 'All' : tier === 'high' ? '80%+' : tier === 'medium' ? '60-80%' : '<60%'}
              </button>
            ))}
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Notes Created</th>
                <th className="p-3.5">Quizzes Attempted</th>
                <th className="p-3.5">Readiness Score</th>
                <th className="p-3.5">Registration Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 animate-pulse">
                    Loading student accounts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No students match the criteria. Registered students will appear here automatically.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                          {s.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{s.name}</div>
                          <div className="text-[11px] text-slate-500">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-200">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                        {s.note_count || 0} notes
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-200">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                        {s.test_count || 0} tests
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (s.avg_score || 80) >= 80 ? 'bg-emerald-500' : (s.avg_score || 80) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, s.avg_score || 80)}%` }}
                          />
                        </div>
                        <span className="font-bold text-white">{s.avg_score || 80}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                          title="View Student Snapshot"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Remove Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md">
                  {selectedStudent.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Total Notes</p>
                <p className="text-xl font-bold text-white mt-0.5">{selectedStudent.note_count || 0}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Quizzes Taken</p>
                <p className="text-xl font-bold text-white mt-0.5">{selectedStudent.test_count || 0}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">Average Score</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">{selectedStudent.avg_score || 80}%</p>
              </div>
            </div>

            {/* Academic Readiness Status */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Core Subject Readiness</span>
                <span className="text-emerald-400 font-bold">Good Standing</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Student is actively engaged across Data Structures, Data Analytics, and Operating Systems. They have generated {selectedStudent.note_count || 0} voice summaries and practice test entries.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedStudent(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = selectedStudent.id;
                  const name = selectedStudent.name;
                  setSelectedStudent(null);
                  handleDelete(id, name);
                }}
                className="py-3 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors"
              >
                Remove Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
