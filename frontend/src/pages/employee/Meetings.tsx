import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, Plus, Search, Calendar, Clock, AlertCircle, 
  CheckCircle2, Loader2, Sparkles, Filter, ChevronRight, Mic,
  CheckSquare, Users, Trash2, Send, Copy, Link2, Share2, FileText
} from 'lucide-react';
import api from '../../lib/api';

interface Participant {
  userId?: string;
  name: string;
  email: string;
}

interface MeetingItem {
  _id: string;
  title: string;
  organizer: string;
  participants: Participant[];
  scheduledAt?: string;
  audioUrl?: string;
  status: 'scheduled' | 'recording' | 'processing' | 'done' | 'failed';
  created_at: string;
}

export default function Meetings() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [participantInput, setParticipantInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [shareModalMeeting, setShareModalMeeting] = useState<MeetingItem | null>(null);
  const [sendingLink, setSendingLink] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState('');

  const navigate = useNavigate();

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/meetings');
      let data = res.data?.data?.meetings || [];
      
      // Auto-seed dummy data if empty
      if (data.length === 0) {
        data = await createDummyData();
      }
      setMeetings(data);
    } catch (err: any) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDummyData = async () => {
    try {
      const meetRes = await api.post('/meetings', {
        title: 'Q3 Strategy & Dummy Sync',
        participants: [{ name: 'Jane Doe', email: 'jane@company.com' }],
      });
      const meetingId = meetRes.data.data._id;
      
      // Create decisions
      await api.post(`/meetings/${meetingId}/decisions`, { text: 'Expand operations to Europe in Q4.' });
      await api.post(`/meetings/${meetingId}/decisions`, { text: 'Adopt hybrid work policy starting next month.' });
      
      // Create action items
      await api.post(`/meetings/${meetingId}/action-items`, {
        task: 'Draft European expansion budget',
        owner: { name: 'Jane Doe', email: 'jane@company.com' },
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      });
      
      // Create a mock summary on backend side ideally, but this serves as the meeting container.
      // We will re-fetch to get the updated list
      const updated = await api.get('/meetings');
      return updated.data?.data?.meetings || [];
    } catch (e) {
      console.error('Failed to create dummy data', e);
      return [];
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleDeleteMeeting = async (meetingId: string) => {
    setDeletingId(meetingId);
    try {
      await api.delete(`/meetings/${meetingId}`);
      setMeetings(prev => prev.filter(m => m._id !== meetingId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete meeting.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleSendMeetingLink = async (meeting: MeetingItem) => {
    setSendingLink(true);
    setSendSuccessMsg('');
    try {
      const res = await api.post(`/meetings/${meeting._id}/share`);
      const msg = res.data?.message || 'Meeting link sent to all participants & users!';
      setSendSuccessMsg(msg);
      setShareModalMeeting(meeting);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send meeting link.');
    } finally {
      setSendingLink(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError('');

    const participants = participantInput
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => {
        if (p.includes('<') && p.includes('>')) {
          const name = p.split('<')[0].trim();
          const email = p.split('<')[1].replace('>', '').trim();
          return { name, email };
        }
        return { name: p.split('@')[0], email: p };
      });

    try {
      const res = await api.post('/meetings', {
        title,
        participants,
      });
      const newMeeting = res.data?.data;
      setNewModalOpen(false);
      setTitle('');
      setParticipantInput('');
      navigate(`/meetings/${newMeeting._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create meeting.');
    } finally {
      setCreating(false);
    }
  };

  const filtered = meetings.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.participants?.some(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchSearch) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Processed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing AI...
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5" /> Ready for Audio
          </span>
        );
    }
  };

  const processedCount = meetings.filter(m => m.status === 'done').length;
  const processingCount = meetings.filter(m => m.status === 'processing').length;

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-3">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Employee Meeting Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Meeting Intelligence & <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Action Tracker</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
              Record voice meetings in-browser or upload recordings to automatically transcribe audio, generate executive summaries, and extract actionable decisions and tasks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/meetings/new"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <Mic className="w-4 h-4" /> Record New Meeting
            </Link>
            <button
              onClick={() => setNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
            >
              <Plus className="w-4 h-4" /> Schedule / Upload
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Meetings</span>
            <p className="text-2xl font-black text-white mt-1">{meetings.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">AI Processed</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{processedCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">In Progress</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{processingCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Archive Search</span>
              <p className="text-xs text-slate-300 mt-1 font-medium">Search Transcripts</p>
            </div>
            <Link
              to="/meeting-search"
              className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Search Meetings"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search meetings by title or participant..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 flex items-center gap-1"><Filter className="w-3 h-3" /> Status:</span>
          {['all', 'done', 'processing', 'scheduled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading meeting archives...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No meetings found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filter to see more meetings.'
                : 'Start by creating your first meeting to record audio and extract AI summaries.'}
            </p>
          </div>
          <button
            onClick={() => setNewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
          >
            Create First Meeting
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <div
              key={m._id}
              onClick={() => navigate(`/meetings/${m._id}`)}
              className="group rounded-3xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/20 cursor-pointer"
            >
              <div>
                {/* Status + Date Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {getStatusBadge(m.status)}
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                  {m.title}
                </h3>

                {/* Participants */}
                <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {m.participants?.length || 0} Participant(s)
                    </span>
                    {m.status === 'done' && (
                      <span className="text-blue-400 flex items-center gap-1 text-[11px] font-semibold">
                        <FileText className="w-3 h-3" /> Transcript Ready
                      </span>
                    )}
                  </div>

                  {/* Avatars */}
                  {m.participants && m.participants.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {m.participants.slice(0, 4).map((p, idx) => (
                        <div
                          key={idx}
                          title={p.name || p.email}
                          className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-[10px] font-bold flex items-center justify-center text-white border border-slate-900"
                        >
                          {(p.name?.[0] || p.email?.[0] || 'U').toUpperCase()}
                        </div>
                      ))}
                      {m.participants.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-semibold px-1">
                          +{m.participants.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400 group-hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1">
                  Open Workspace <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleSendMeetingLink(m)}
                    className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-colors"
                    title="Send link to all users / copy link"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setConfirmDeleteId(m._id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                    title="Delete meeting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create New Meeting Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">New Meeting Room</h3>
                  <p className="text-xs text-slate-400">Initialize a workspace for audio transcription.</p>
                </div>
              </div>
              <button
                onClick={() => setNewModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Sprint Planning & Budget Review"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Participants (comma separated)
                </label>
                <input
                  type="text"
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  placeholder="john@company.com, sarah@company.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Optional: Extracted action items will be mapped to these participants.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create & Launch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Delete Meeting?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  This will permanently delete the meeting, its transcript, summary, decisions, and all action items.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-white">
                {meetings.find(m => m._id === confirmDeleteId)?.title || 'Selected meeting'}
              </span>
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deletingId === confirmDeleteId}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMeeting(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {deletingId === confirmDeleteId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share / Send Link Modal */}
      {shareModalMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Meeting Links & Invites Sent!</h3>
                  <p className="text-xs text-slate-400">Links dispatched to all participants & users.</p>
                </div>
              </div>
              <button
                onClick={() => setShareModalMeeting(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {sendSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{sendSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  1. Live Room Link (Anyone can join)
                </label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/meetings/live/${shareModalMeeting._id}`}
                    className="flex-1 bg-transparent text-xs text-white outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/meetings/live/${shareModalMeeting._id}`);
                      alert('Live Room link copied!');
                    }}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  2. Meeting Workspace Link (Summary, Action Items)
                </label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/meetings/${shareModalMeeting._id}`}
                    className="flex-1 bg-transparent text-xs text-white outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/meetings/${shareModalMeeting._id}`);
                      alert('Workspace link copied!');
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShareModalMeeting(null)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
