import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, Search, Calendar, Clock, AlertCircle, 
  CheckCircle2, Loader2, Filter, ChevronRight, Mic,
  Users, Trash2, Send, Copy, Video, UploadCloud,
  FileAudio, Plus, BookOpen, ShieldAlert, Check, Mail
} from 'lucide-react';
import api from '../../lib/api';
import ComplaintModal from '../../components/ComplaintModal';
import AppGuideModal from '../../components/AppGuideModal';

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
  dueTime?: string;
  agenda?: string;
  meetingLink?: string;
  audioUrl?: string;
  status: 'scheduled' | 'recording' | 'processing' | 'done' | 'failed';
  created_at: string;
}

export default function Meetings() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Conduct Live Meeting Setup Modal
  const [conductModalOpen, setConductModalOpen] = useState(false);
  const [conductTitle, setConductTitle] = useState('');
  const [conductDate, setConductDate] = useState('');
  const [conductDueTime, setConductDueTime] = useState('');
  const [conductAgenda, setConductAgenda] = useState('');
  const [conductParticipants, setConductParticipants] = useState('');
  const [conductPreviewId, setConductPreviewId] = useState('');
  const [copiedConductLink, setCopiedConductLink] = useState(false);
  const [conductError, setConductError] = useState('');

  // Support & Guide modals
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Schedule / Quick Meeting Modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [participantInput, setParticipantInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [conductingLive, setConductingLive] = useState(false);
  const [error, setError] = useState('');

  // Upload Previous Meeting Recording Modal
  const [uploadPastModalOpen, setUploadPastModalOpen] = useState(false);
  const [pastTitle, setPastTitle] = useState('');
  const [pastDate, setPastDate] = useState('');
  const [pastParticipants, setPastParticipants] = useState('');
  const [pastFile, setPastFile] = useState<File | null>(null);
  const [uploadingPast, setUploadingPast] = useState(false);
  const [pastUploadError, setPastUploadError] = useState('');
  
  // Delete & Share modals
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [shareModalMeeting, setShareModalMeeting] = useState<MeetingItem | null>(null);
  const [sendSuccessMsg, setSendSuccessMsg] = useState('');

  const navigate = useNavigate();

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/meetings');
      let data = res.data?.data?.meetings || [];
      
      // Auto-seed dummy meeting if empty
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
        title: 'Q3 Strategy & Product Sync',
        participants: [{ name: 'Jane Doe', email: 'jane@company.com' }],
      });
      const meetingId = meetRes.data.data._id;
      
      await api.post(`/meetings/${meetingId}/decisions`, { text: 'Expand operations and launch new AI features in Q4.' });
      await api.post(`/meetings/${meetingId}/action-items`, {
        task: 'Finalize meeting documentation and share with engineering lead',
        owner: { name: 'Jane Doe', email: 'jane@company.com' },
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      });
      
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

  // Open setup dialog before conducting
  const openConductModal = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeFormatted = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const previewId = 'm-' + Math.random().toString(36).slice(2, 10);

    setConductTitle(`Product & Team Sync (${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`);
    setConductDate(dateStr);
    setConductDueTime(`${timeFormatted} (45 mins)`);
    setConductAgenda('Discuss active priorities, address roadblocks, review AI action items.');
    setConductParticipants('');
    setConductPreviewId(previewId);
    setCopiedConductLink(false);
    setConductError('');
    setConductModalOpen(true);
  };

  // Launch live meeting and dispatch email invitations to participants
  const handleLaunchConductMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conductTitle.trim()) {
      setConductError('Please specify a title for the live meeting.');
      return;
    }

    setConductingLive(true);
    setConductError('');

    try {
      const parts = conductParticipants
        .split(/[,\n]/)
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => ({
          name: p.includes('@') ? p.split('@')[0] : p,
          email: p,
        }));

      const origin = window.location.origin;
      // Pre-generated live link
      const liveLink = `${origin}/meetings/live/${conductPreviewId}/room`;

      const res = await api.post('/meetings', {
        title: conductTitle.trim(),
        scheduledAt: conductDate ? new Date(conductDate).toISOString() : new Date().toISOString(),
        dueTime: conductDueTime.trim() || undefined,
        agenda: conductAgenda.trim() || undefined,
        participants: parts,
        meetingLink: liveLink,
      });

      const createdMeeting = res.data?.data;
      const finalMeetingId = createdMeeting?._id || conductPreviewId;

      setConductModalOpen(false);
      // Immediately enter live meeting room as host
      navigate(`/meetings/live/${finalMeetingId}/room`);
    } catch (err: any) {
      setConductError(err.response?.data?.error || err.message || 'Failed to conduct live meeting.');
    } finally {
      setConductingLive(false);
    }
  };

  // Upload Previous Meeting Recording
  const handleUploadPreviousRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastTitle.trim()) {
      setPastUploadError('Please enter the previous meeting title.');
      return;
    }
    if (!pastFile) {
      setPastUploadError('Please select the meeting recording file to upload.');
      return;
    }

    setUploadingPast(true);
    setPastUploadError('');

    try {
      const parts = pastParticipants
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => ({ name: p.split('@')[0], email: p }));

      // 1. Create meeting entry
      const createRes = await api.post('/meetings', {
        title: pastTitle.trim(),
        participants: parts,
        scheduledAt: pastDate || undefined,
      });

      const meetingId = createRes.data?.data?._id;

      // 2. Upload the recorded audio/video file
      const formData = new FormData();
      formData.append('audio', pastFile, pastFile.name);

      await api.post(`/meetings/${meetingId}/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 3. Reset and navigate to meeting details
      setUploadPastModalOpen(false);
      setPastTitle('');
      setPastDate('');
      setPastParticipants('');
      setPastFile(null);
      navigate(`/meetings/${meetingId}`);
    } catch (err: any) {
      setPastUploadError(err.response?.data?.error || err.message || 'Failed to upload previous recording.');
    } finally {
      setUploadingPast(false);
    }
  };

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
    setSendSuccessMsg('');
    try {
      const res = await api.post(`/meetings/${meeting._id}/share`);
      const msg = res.data?.message || 'Meeting link sent to all participants & users!';
      setSendSuccessMsg(msg);
      setShareModalMeeting(meeting);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send meeting link.');
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
      .map(p => ({ name: p.split('@')[0], email: p }));

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
            <CheckCircle2 className="w-3.5 h-3.5" /> Transcribed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-pulse">
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
    <div className="p-6 text-slate-100 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 font-sans">
      
      {/* Top Header Banner */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 mb-3">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Employee Meeting Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Meeting Intelligence & <span className="text-indigo-400">Action Tracker</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
              Conduct live voice/video meetings, upload previous meeting recordings, automatically generate speech-to-text transcripts, and track team decisions.
            </p>
          </div>

          {/* Action Buttons: Conduct Meeting, Guide, Complaint Box & Uploads */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={openConductModal}
              disabled={conductingLive}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
            >
              {conductingLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
              <span>Conduct Live Meeting</span>
            </button>

            <button
              onClick={() => {
                setPastUploadError('');
                setUploadPastModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>Upload Past Recording</span>
            </button>

            <Link
              to="/meetings/new"
              className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Record In-Browser</span>
            </Link>

            <button
              onClick={() => setNewModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => setGuideModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-3 rounded-2xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-all cursor-pointer"
              title="Step-by-Step Operator Guide"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Guide</span>
            </button>

            <button
              onClick={() => setComplaintModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer"
              title="Helpdesk & Complaint Box"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Helpdesk</span>
            </button>
          </div>
        </div>


        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Meetings</span>
            <p className="text-2xl font-black text-white mt-1">{meetings.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Transcribed</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{processedCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">In Progress</span>
            <p className="text-2xl font-black text-indigo-400 mt-1">{processingCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Archive Search</span>
              <p className="text-xs text-slate-300 mt-1 font-medium">Search Transcripts</p>
            </div>
            <Link
              to="/meeting-search"
              className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Search className="w-4 h-4" />
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
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 flex items-center gap-1"><Filter className="w-3 h-3" /> Status:</span>
          {['all', 'done', 'processing', 'scheduled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
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
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading meeting archives...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Meetings Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Start by conducting a live meeting or uploading a previous recording to build your workspace intelligence archive.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={openConductModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
            >
              Conduct Live Meeting
            </button>
            <button
              onClick={() => setUploadPastModalOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all cursor-pointer"
            >
              Upload Previous Recording
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((meeting) => (
            <div
              key={meeting._id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {meeting.title}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(meeting.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>{getStatusBadge(meeting.status)}</div>
                </div>

                {/* Participants */}
                {meeting.participants && meeting.participants.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">
                      {meeting.participants.map(p => p.name || p.email).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendMeetingLink(meeting)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Send Meeting Link"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(meeting._id)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Meeting"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/meetings/live/${meeting._id}/room`}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <Video className="w-3 h-3" />
                    <span>Join Room</span>
                  </Link>
                  <Link
                    to={`/meetings/${meeting._id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                  >
                    <span>Open</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD PREVIOUS MEETING RECORDING MODAL */}
      {uploadPastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Upload Past Meeting Recording</h3>
                  <p className="text-xs text-slate-400">Ingest previous audio/video to run speech-to-text</p>
                </div>
              </div>
              <button
                onClick={() => setUploadPastModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {pastUploadError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{pastUploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadPreviousRecording} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={pastTitle}
                  onChange={(e) => setPastTitle(e.target.value)}
                  placeholder="e.g. Q2 Architecture & Sprint Retrospective"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Date</label>
                  <input
                    type="datetime-local"
                    value={pastDate}
                    onChange={(e) => setPastDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Participants (Emails)</label>
                  <input
                    type="text"
                    value={pastParticipants}
                    onChange={(e) => setPastParticipants(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Recording File (Audio or Video) *</label>
                <div className="p-6 rounded-2xl bg-slate-950 border border-dashed border-slate-800 hover:border-indigo-500/50 flex flex-col items-center justify-center text-center space-y-3 transition-colors">
                  <FileAudio className="w-8 h-8 text-indigo-400" />
                  <div className="text-xs">
                    <p className="font-semibold text-white">
                      {pastFile ? pastFile.name : 'Choose an audio or video recording file'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">MP3, WAV, WEBM, M4A, MP4 (up to 200MB)</p>
                  </div>
                  <label className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer transition-all">
                    Browse File
                    <input
                      type="file"
                      accept="audio/*,video/*,.mp3,.wav,.webm,.m4a,.mp4"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPastFile(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setUploadPastModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPast || !pastFile}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploadingPast && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{uploadingPast ? 'Uploading & Transcribing...' : 'Upload & Transcribe'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Delete Meeting Archive?</h3>
                <p className="text-xs text-slate-400">All transcripts and action items will be removed.</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMeeting(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                {deletingId === confirmDeleteId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Links Modal */}
      {shareModalMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Meeting Links Ready</h3>
                  <p className="text-xs text-slate-400">Share with participants to conduct or review</p>
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
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{sendSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Live Meeting Room URL
                </label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/meetings/live/${shareModalMeeting._id}/room`}
                    className="flex-1 bg-transparent text-xs text-white outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/meetings/live/${shareModalMeeting._id}/room`);
                      alert('Live Room link copied!');
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Meeting Workspace URL (Transcript & Actions)
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
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Schedule New Meeting</h3>
                  <p className="text-xs text-slate-400">Set meeting agenda and participants</p>
                </div>
              </div>
              <button
                onClick={() => setNewModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sprint Planning Sync"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Participants (Emails)</label>
                <input
                  type="text"
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  placeholder="alice@company.com, bob@company.com"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{creating ? 'Scheduling...' : 'Create Meeting'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Conduct Live Meeting Setup Modal (Configure Date, Due Time, Participants & Invites) ─── */}
      {conductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shadow-md">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Conduct Live Meeting</h3>
                  <p className="text-xs text-slate-400">Configure schedule, due time, agenda & invite participants</p>
                </div>
              </div>
              <button
                onClick={() => setConductModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {conductError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{conductError}</span>
              </div>
            )}

            <form onSubmit={handleLaunchConductMeeting} className="space-y-4">
              {/* Meeting Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={conductTitle}
                  onChange={(e) => setConductTitle(e.target.value)}
                  placeholder="e.g. Q4 Strategy & AI Architecture Sync"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Date & Due / Start Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={conductDate}
                    onChange={(e) => setConductDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Due / Start Time & Duration</label>
                  <input
                    type="text"
                    required
                    value={conductDueTime}
                    onChange={(e) => setConductDueTime(e.target.value)}
                    placeholder="e.g. 10:30 AM (45 mins)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Agenda */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Agenda & Objectives</label>
                <textarea
                  rows={2}
                  value={conductAgenda}
                  onChange={(e) => setConductAgenda(e.target.value)}
                  placeholder="Key topics to discuss, goals, deliverables..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Participants Email IDs */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Participant Email IDs (To receive invite email & app sync)</span>
                  <span className="text-[10px] text-indigo-400">Comma-separated</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={conductParticipants}
                    onChange={(e) => setConductParticipants(e.target.value)}
                    placeholder="sarah@gmail.com, alex@company.com, rahul@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Participants will receive a direct invitation email with the join button and the meeting will automatically appear on their respective dashboard.
                </span>
              </div>

              {/* Pre-generated Meeting Share Link */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Live Meeting Link to Share
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/meetings/live/${conductPreviewId}/room`}
                    className="flex-1 bg-slate-950 px-3 py-2 rounded-xl text-xs text-white font-mono border border-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/meetings/live/${conductPreviewId}/room`);
                      setCopiedConductLink(true);
                      setTimeout(() => setCopiedConductLink(false), 2000);
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    {copiedConductLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setConductModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={conductingLive}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {conductingLive ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching Invites & Starting...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Conduct & Send Invites →</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Box Modal for Employee Portal */}
      <ComplaintModal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        userRole="employee"
      />

      {/* Operator Step-by-Step Guide Modal for Employee Portal */}
      <AppGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        role="employee"
      />

    </div>
  );
}

