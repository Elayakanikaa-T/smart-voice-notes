import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare, Filter, Calendar, AlertTriangle,
  Loader2, Bell, ExternalLink, Check, Sparkles,
  Edit3, Trash2, RefreshCw, User, Search
} from 'lucide-react';
import api from '../../lib/api';

interface ActionItem {
  _id: string;
  meetingId: string;
  task: string;
  owner: {
    userId?: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  status: 'open' | 'in_progress' | 'done';
  progress?: number;
  created_at: string;
}

interface InAppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedMeetingId?: string;
  created_at: string;
}

export default function MyTasks() {
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'done' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingTask, setEditingTask] = useState<ActionItem | null>(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<'open' | 'in_progress' | 'done'>('open');
  const [editProgress, setEditProgress] = useState<number>(0);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchTasksAndNotifications = async () => {
    try {
      setLoading(true);
      const [tasksRes, notifsRes] = await Promise.all([
        api.get('/tasks/my-action-items').catch(() => ({ data: { data: [] } })),
        api.get('/tasks/notifications').catch(() => ({ data: { data: { notifications: [], unreadCount: 0 } } })),
      ]);

      setTasks(tasksRes.data?.data || []);
      setNotifications(notifsRes.data?.data?.notifications || []);
      setUnreadCount(notifsRes.data?.data?.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching tasks/notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndNotifications();
  }, []);

  const handleUpdateTask = async (
    itemId: string,
    meetingId: string,
    updates: Partial<ActionItem> & { progress?: number }
  ) => {
    setUpdatingId(itemId);
    try {
      const res = await api.patch(`/meetings/${meetingId}/action-items/${itemId}`, updates);
      const updated = res.data?.data;
      setTasks((prev) =>
        prev.map((t) => (t._id === itemId ? { ...t, ...updates, ...updated } : t))
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update action item.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (itemId: string, meetingId: string, status: 'open' | 'in_progress' | 'done') => {
    const progress = status === 'done' ? 100 : status === 'in_progress' ? 50 : 0;
    await handleUpdateTask(itemId, meetingId, { status, progress });
  };

  const handleProgressChange = async (itemId: string, meetingId: string, progress: number) => {
    const status: 'open' | 'in_progress' | 'done' =
      progress === 100 ? 'done' : progress > 0 ? 'in_progress' : 'open';
    await handleUpdateTask(itemId, meetingId, { progress, status });
  };

  const handleDeleteTask = async (itemId: string, meetingId: string) => {
    if (!window.confirm('Delete this action item?')) return;
    try {
      await api.delete(`/meetings/${meetingId}/action-items/${itemId}`);
      setTasks((prev) => prev.filter((t) => t._id !== itemId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete task.');
    }
  };

  const openEditModal = (task: ActionItem) => {
    setEditingTask(task);
    setEditTaskText(task.task);
    setEditOwnerName(task.owner?.name || '');
    setEditOwnerEmail(task.owner?.email || '');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditStatus(task.status || 'open');
    setEditProgress(task.progress ?? (task.status === 'done' ? 100 : task.status === 'in_progress' ? 50 : 0));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setSavingEdit(true);

    try {
      await handleUpdateTask(editingTask._id, editingTask.meetingId, {
        task: editTaskText,
        owner: {
          ...editingTask.owner,
          name: editOwnerName || 'Unassigned',
          email: editOwnerEmail || 'team@company.com',
        },
        dueDate: editDueDate || undefined,
        status: editStatus,
        progress: editProgress,
      });
      setEditingTask(null);
    } catch (err: any) {
      alert('Failed to save changes.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await api.patch('/tasks/notifications/read', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const now = new Date();

  const filteredTasks = tasks.filter((t) => {
    const isOverdue = t.dueDate && new Date(t.dueDate) < now && t.status !== 'done';
    if (filter === 'overdue' && !isOverdue) return false;
    if (filter === 'open' && t.status !== 'open') return false;
    if (filter === 'in_progress' && t.status !== 'in_progress') return false;
    if (filter === 'done' && t.status !== 'done') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        t.task.toLowerCase().includes(q) ||
        t.owner?.name?.toLowerCase().includes(q) ||
        t.owner?.email?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const overdueCount = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length;

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mb-2">
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> Action Tracker
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">My Action Items & Deliverables</h1>
            <p className="text-slate-400 text-sm mt-1">
              Cross-meeting aggregation of all deliverables with real-time progress slider, status sync, and editing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTasksAndNotifications}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              title="Refresh deliverables"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) handleMarkNotificationsRead();
              }}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Reminders</span>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Assigned</span>
            <p className="text-2xl font-black text-white mt-1">{tasks.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">In Progress</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{inProgressCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Completed</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{doneCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Overdue</span>
            <p className="text-2xl font-black text-rose-400 mt-1">{overdueCount}</p>
          </div>
        </div>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl space-y-4 animate-in slide-in-from-top-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" /> In-App Reminders & Meeting Notifications
            </h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400">No recent notifications.</p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                    n.read ? 'bg-slate-950/50 border-slate-800/80 text-slate-300' : 'bg-cyan-500/10 border-cyan-500/30 text-white'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{n.message}</p>
                    {n.relatedMeetingId && (
                      <Link
                        to={`/meetings/${n.relatedMeetingId}`}
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline pt-1 font-semibold"
                      >
                        Open related meeting <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action items by task or owner..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 flex items-center gap-1"><Filter className="w-3 h-3" /> Filter:</span>
          {(['all', 'open', 'in_progress', 'done', 'overdue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all whitespace-nowrap ${
                filter === st
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === 'in_progress' ? 'In Progress' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading action items...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No action items found</h3>
          <p className="text-xs text-slate-400">
            {searchTerm || filter !== 'all'
              ? 'Try changing your search term or filter options.'
              : 'All your deliverables are tracked here once extracted from meetings.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((t) => {
            const isOverdue = t.dueDate && new Date(t.dueDate) < now && t.status !== 'done';
            const progress = t.progress ?? (t.status === 'done' ? 100 : t.status === 'in_progress' ? 50 : 0);
            const isUpdating = updatingId === t._id;

            return (
              <div
                key={t._id}
                className={`p-6 rounded-3xl bg-slate-900 border transition-all duration-200 shadow-xl space-y-4 ${
                  isOverdue ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> OVERDUE
                        </span>
                      )}
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        t.status === 'done'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : t.status === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {t.status === 'in_progress' ? 'In Progress' : t.status}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold leading-snug ${t.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
                      {t.task}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <strong>{t.owner?.name || 'Unassigned'}</strong> ({t.owner?.email || 'No email'})
                      </span>

                      {t.dueDate && (
                        <span className={`flex items-center gap-1 font-mono ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          Due: {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}

                      <Link
                        to={`/meetings/${t.meetingId}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-semibold"
                      >
                        <span>Meeting Workspace</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Actions & Status Buttons */}
                  <div className="flex items-center gap-2 self-start flex-shrink-0">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                      title="Edit task & progress"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTask(t._id, t.meetingId)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Delete action item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Interactive Progress Bar & Controls */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Deliverable Progress</span>
                    <span className="font-bold font-mono text-cyan-400">{progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        progress === 100
                          ? 'bg-emerald-500'
                          : progress >= 50
                          ? 'bg-cyan-500'
                          : progress > 0
                          ? 'bg-amber-500'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Quick Progress Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      {[0, 25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          disabled={isUpdating}
                          onClick={() => handleProgressChange(t._id, t.meetingId, pct)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            progress === pct
                              ? 'bg-cyan-600 text-white shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {t.status !== 'done' ? (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(t._id, t.meetingId, 'done')}
                          className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark Done
                        </button>
                      ) : (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(t._id, t.meetingId, 'open')}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Action Item Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Edit Action Item</h3>
                  <p className="text-xs text-slate-400">Update task deliverable, owner, due date, and progress.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Description</label>
                <textarea
                  required
                  rows={2}
                  value={editTaskText}
                  onChange={(e) => setEditTaskText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Owner Name</label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Owner Email</label>
                  <input
                    type="email"
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => {
                      const s = e.target.value as any;
                      setEditStatus(s);
                      if (s === 'done') setEditProgress(100);
                      else if (s === 'open') setEditProgress(0);
                      else if (s === 'in_progress' && (editProgress === 0 || editProgress === 100)) setEditProgress(50);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300">Progress: {editProgress}%</label>
                  <span className="text-[11px] text-slate-400">Slide to adjust</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editProgress}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditProgress(val);
                    if (val === 100) setEditStatus('done');
                    else if (val > 0) setEditStatus('in_progress');
                    else setEditStatus('open');
                  }}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !editTaskText.trim()}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 rounded-xl shadow-lg shadow-cyan-600/30 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
