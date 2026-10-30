import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  Briefcase, 
  Eye, 
  X, 
  CheckCircle2, 
  Download, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  Loader2 
} from 'lucide-react';
import api from '../../lib/api';

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  phone?: string;
  institution?: string;
  grade_or_designation?: string;
  created_at: string;
}

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      const allUsers = data.data || [];
      // Filter for employee accounts
      const employeeList = allUsers.filter((u: any) => u.role === 'employee' || u.email?.toLowerCase().includes('employee'));
      setEmployees(employeeList);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove employee "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${id}`);
      setActionSuccess(`Employee ${name} was successfully removed.`);
      fetchEmployees();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove employee.');
    }
  };

  const handleExportCSV = () => {
    if (employees.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Designation / Department', 'Phone', 'Date Registered'];
    const rows = employees.map(e => [
      e.id,
      `"${e.name}"`,
      e.email,
      e.role || 'employee',
      e.status || 'Active',
      `"${e.grade_or_designation || e.institution || 'Staff'}"`,
      e.phone || 'N/A',
      new Date(e.created_at).toISOString().split('T')[0]
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = employees.filter(e => {
    const matchText = e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (e.grade_or_designation && e.grade_or_designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (e.institution && e.institution.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchText) return false;
    if (filterStatus === 'active') return (e.status || 'Active').toLowerCase() === 'active';
    if (filterStatus === 'other') return (e.status || 'Active').toLowerCase() !== 'active';
    return true;
  });

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Staff Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Employee Directory & Management
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Monitor registered staff, manage employee credentials, view departments, and control team access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={employees.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Staff</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white">{loading ? '—' : employees.length}</p>
          <p className="text-xs text-indigo-400 mt-2 font-medium">Registered Employees</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Status</span>
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">
            {loading ? '—' : employees.filter(e => (e.status || 'Active').toLowerCase() === 'active').length}
          </p>
          <p className="text-xs text-emerald-400 mt-2 font-medium">Currently Available</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Access Scope</span>
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-purple-400">Employee Portal</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Meeting & Intelligence Tools</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees by name, email, department, or title..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="other">Away / Other</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-xs uppercase tracking-wider font-semibold">Loading Employee Directory...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No employees found.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm ? 'Try adjusting your search criteria.' : 'When users sign up with the Employee role, they will appear in this directory.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department / Designation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                          {emp.name?.[0]?.toUpperCase() || 'E'}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight">{emp.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Briefcase size={12} className="text-slate-500" />
                        <span>{emp.grade_or_designation || emp.institution || 'Staff Member'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {emp.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {emp.phone || <span className="text-slate-500 italic">Not provided</span>}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : 'Active Member'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Profile Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Remove Employee Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={() => setSelectedEmployee(null)}>
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
                  {selectedEmployee.name?.[0]?.toUpperCase() || 'E'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedEmployee.name}</h3>
                  <p className="text-slate-400 text-xs">{selectedEmployee.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Designation / Role</span>
                <span className="text-white font-medium">{selectedEmployee.grade_or_designation || 'Staff Member'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Department / Organization</span>
                <span className="text-white font-medium">{selectedEmployee.institution || 'Organization Staff'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Contact Phone</span>
                <span className="text-white font-medium">{selectedEmployee.phone || 'Not provided'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Account Status</span>
                <span className="text-emerald-400 font-bold">{selectedEmployee.status || 'Active'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
