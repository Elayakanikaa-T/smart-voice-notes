import { useEffect, useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  X, 
  Clock, 
  Loader2, 
  FlaskConical, 
  ChevronRight
} from 'lucide-react';
import api from '../../lib/api';

interface Reminder {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  note?: string;
  due_date?: string;
  reminder_date?: string;
  reminderDate?: string;
  type?: string;
  is_completed?: boolean;
  created_at?: string;
}

const TYPES = ['exam', 'revision', 'assignment', 'other'];

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'exams' | 'reminders'>('all');
  
  const [title, setTitle] = useState('');
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(18, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [date, setDate] = useState(getDefaultDateTime());
  const [type, setType] = useState('exam');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reminders?limit=50');
      const list = data.data?.reminders || data.data || [];
      setReminders(list);
    } catch { 
      setReminders([]); 
    }
    setLoading(false);
  };

  useEffect(() => { 
    load(); 
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedDate = date || getDefaultDateTime();
      await api.post('/reminders', { 
        title: title.trim(), 
        description: note.trim(),
        due_date: selectedDate,
        reminder_date: selectedDate, 
        type, 
        note: note.trim()
      });
      setTitle(''); 
      setDate(getDefaultDateTime()); 
      setType('exam'); 
      setNote(''); 
      setShowForm(false);
      await load();
    } catch (err: any) { 
      alert(err.response?.data?.error || 'Failed to create reminder'); 
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setReminders(prev => prev.filter(r => (r.id || r._id) !== id));
    try { 
      await api.delete(`/reminders/${id}`); 
      load(); 
    } catch { 
      alert('Failed to delete notification'); 
      load();
    }
  };

  const fmtDate = (d?: string | Date) => {
    if (!d) return 'No fixed deadline';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return 'Scheduled';
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isExamNotice = (r: Reminder) => {
    const t = (r.title || '').toLowerCase();
    return t.includes('test published') || t.includes('exam') || t.includes('assessment') || r.type === 'exam';
  };

  const filteredReminders = reminders.filter(r => {
    if (activeTab === 'exams') return isExamNotice(r);
    if (activeTab === 'reminders') return !isExamNotice(r);
    return true;
  });

  return (
    <div className="p-6 text-white max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-amber-400" />
            Student Notifications & Test Alerts
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Instant broadcast notifications for newly published tests, submission deadlines, and scheduled study reminders.
          </p>
        </div>
        <button 
          onClick={() => { setDate(getDefaultDateTime()); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-bold text-xs text-white hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus size={16} /> + Custom Reminder
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Alerts ({reminders.length})
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'exams'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical size={14} /> Official Exam Notices
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'reminders'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Study Goals
        </button>
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell size={18} className="text-blue-400" /> New Study Reminder
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">Reminder Title *</label>
                <input 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Revise Binary Trees before Friday Exam" 
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">Target Date & Time *</label>
                <input 
                  required 
                  type="datetime-local" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">Category</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none capitalize"
                >
                  {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">Note / Instructions</label>
                <textarea 
                  value={note} 
                  onChange={e => setNote(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  rows={2} 
                  placeholder="Topics to focus on, chapter pages..." 
                />
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white text-xs hover:opacity-90 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
              >
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Reminder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-800 animate-pulse" />)}
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="py-20 text-center text-slate-500 rounded-3xl border border-dashed border-slate-800 bg-slate-900/40">
          <Bell size={40} className="mx-auto mb-3 opacity-30 text-amber-400" />
          <p className="font-semibold text-white text-base">No active notifications</p>
          <p className="text-xs text-slate-400 mt-1">Whenever an admin publishes a test, or a reminder is scheduled, it appears here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map((r, idx) => {
            const rid = r.id || r._id || String(idx);
            const isExam = isExamNotice(r);
            const dueDate = r.due_date || r.reminder_date || r.reminderDate;

            return (
              <div 
                key={rid} 
                className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-5 shadow-lg transition-all ${
                  isExam 
                    ? 'border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/15 to-slate-900 hover:border-amber-500/50' 
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`flex-shrink-0 rounded-2xl p-3 border shadow-md ${
                    isExam 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 ring-2 ring-amber-500/10' 
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {isExam ? <FlaskConical size={22} /> : <Bell size={22} />}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-sm">{r.title}</h3>
                      {isExam && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 border border-amber-500/30 text-amber-300">
                          Official Test Notice
                        </span>
                      )}
                    </div>

                    {r.description && (
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {r.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                      <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <Clock size={13} className="text-amber-400" />
                        Deadline: {fmtDate(dueDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isExam && (
                    <a
                      href="/student/quiz"
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:opacity-95 transition-all"
                    >
                      Take Test <ChevronRight size={14} />
                    </a>
                  )}
                  <button 
                    onClick={() => handleDelete(rid)}
                    title="Dismiss alert"
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
