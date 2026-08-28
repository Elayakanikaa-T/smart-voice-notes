import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Square, Upload, Loader2, CheckCircle2,
  FileText, Sparkles, CheckSquare, Plus, Trash2, Edit3, Save, X,
  Calendar, ArrowLeft, RefreshCw, Volume2, Copy, Check, Mic, Users, Video, Link2,
  Share2, Send, Camera, Languages, Play, Pause, FileVideo
} from 'lucide-react';
import api from '../../lib/api';

interface Decision {
  _id: string;
  text: string;
  created_at: string;
}

interface ActionItem {
  _id: string;
  task: string;
  owner: {
    userId?: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  status: 'open' | 'in_progress' | 'done';
  progress?: number;
}

interface TranscriptSegment {
  speaker?: string;
  start?: number;
  end?: number;
  text: string;
}

interface MeetingSummary {
  shortSummary: string;
  detailedNotes: string;
  keyPoints: string[];
  status: string;
}

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<any>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active section tab (Speech-to-Text Transcript is primary)
  const [activeTab, setActiveTab] = useState<'transcript' | 'decisions' | 'tasks'>('transcript');

  // Copy & Share states
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareSuccessMsg, setShareSuccessMsg] = useState('');

  // Decisions Edit/Add state
  const [newDecision, setNewDecision] = useState('');
  const [editingDecisionId, setEditingDecisionId] = useState<string | null>(null);
  const [editingDecisionText, setEditingDecisionText] = useState('');

  // Action Items Edit/Add state
  const [newTask, setNewTask] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<'open' | 'in_progress' | 'done'>('open');
  const [editProgress, setEditProgress] = useState<number>(0);

  // In-page Audio/Video Recording, Playback, and Live Speech Recognition state
  const [recordMediaType, setRecordMediaType] = useState<'audio' | 'video'>('audio');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [savedDuration, setSavedDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recordingLanguage, setRecordingLanguage] = useState('en-US');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const liveVideoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const fetchMeetingData = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/meetings/${id}`);
      const data = res.data?.data;
      setMeeting(data.meeting);
      setTranscript(data.transcript);
      setSummary(data.summary);
      setDecisions(data.decisions || []);
      setActionItems(data.actionItems || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load meeting details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingData();
    return () => {
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [id]);

  // Poll processing status if meeting is in 'processing' state
  useEffect(() => {
    if (!id || meeting?.status !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/meetings/${id}/status`);
        const st = res.data?.data;
        if (st?.meetingStatus === 'done' || st?.meetingStatus === 'failed') {
          fetchMeetingData();
          clearInterval(interval);
        }
      } catch (e) {
        console.error('Status poll error:', e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [id, meeting?.status]);

  // Speech Recognition setup for exact speech matching
  const initLiveRecognition = (lang = 'en-US') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang;

      rec.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + piece.trim();
          } else {
            interim += ' ' + piece.trim();
          }
        }
        const combined = (finalTranscriptRef.current + (interim ? ' ' + interim : '')).trim();
        if (combined) {
          setLiveTranscript(combined);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('[LiveSTT] status:', e.error);
      };

      rec.onend = () => {
        if (isRecordingRef.current) {
          setTimeout(() => {
            if (isRecordingRef.current) initLiveRecognition(lang);
          }, 150);
        }
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.warn('[LiveSTT] failed:', e);
    }
  };

  // Handle in-page recording with playback option
  const startRecording = async (type: 'audio' | 'video' = recordMediaType) => {
    try {
      setRecordedBlob(null);
      setRecordedAudioUrl(null);
      setLiveTranscript('');
      finalTranscriptRef.current = '';
      isRecordingRef.current = true;

      const constraints: MediaStreamConstraints = type === 'video'
        ? { audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 } } }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (type === 'video' && liveVideoPreviewRef.current) {
        liveVideoPreviewRef.current.srcObject = stream;
      }

      const mimeType = type === 'video'
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm')
        : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm');

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(250); // Timeslice 250ms guarantees all chunks are captured
      setIsRecording(true);
      setRecordingDuration(0);
      setSavedDuration(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingDuration((p) => {
          const next = p + 1;
          setSavedDuration(next);
          return next;
        });
      }, 1000);

      initLiveRecognition(recordingLanguage);
    } catch (err: any) {
      alert('Could not access microphone/camera: ' + err.message);
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecordedBlob(file);
      setRecordedAudioUrl(URL.createObjectURL(file));
      setRecordMediaType(file.type.startsWith('video') ? 'video' : 'audio');
      await uploadAudioBlob(file);
    }
  };

  const uploadAudioBlob = async (fileOrBlob: Blob | File, exactText?: string) => {
    if (!id) return;
    setAudioUploading(true);
    try {
      const textToSend = exactText !== undefined ? exactText : liveTranscript;
      const formData = new FormData();
      const filename = recordMediaType === 'video' ? 'meeting_video.webm' : 'recording.webm';
      formData.append('audio', fileOrBlob, filename);
      if (textToSend && textToSend.trim()) {
        formData.append('transcriptText', textToSend.trim());
      }

      await api.post(`/meetings/${id}/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchMeetingData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Media upload failed.');
    } finally {
      setAudioUploading(false);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Regenerate Summary
  const handleRegenerateSummary = async () => {
    if (!id) return;
    setRegenerating(true);
    try {
      await api.post(`/meetings/${id}/summary/regenerate`);
      fetchMeetingData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to trigger summary regeneration.');
    } finally {
      setRegenerating(false);
    }
  };

  // Decision CRUD
  const handleAddDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.trim() || !id) return;
    try {
      const res = await api.post(`/meetings/${id}/decisions`, { text: newDecision });
      setDecisions((prev) => [...prev, res.data.data]);
      setNewDecision('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add decision.');
    }
  };

  const handleSaveDecision = async (decisionId: string) => {
    if (!id || !editingDecisionText.trim()) return;
    try {
      const res = await api.patch(`/meetings/${id}/decisions/${decisionId}`, { text: editingDecisionText });
      setDecisions((prev) => prev.map((d) => (d._id === decisionId ? res.data.data : d)));
      setEditingDecisionId(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update decision.');
    }
  };

  const handleDeleteDecision = async (decisionId: string) => {
    if (!id || !window.confirm('Delete this decision?')) return;
    try {
      await api.delete(`/meetings/${id}/decisions/${decisionId}`);
      setDecisions((prev) => prev.filter((d) => d._id !== decisionId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete decision.');
    }
  };

  // Action Item CRUD
  const handleAddActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !id) return;
    try {
      const res = await api.post(`/meetings/${id}/action-items`, {
        task: newTask,
        owner: {
          name: newOwnerName || 'Unassigned',
          email: newOwnerEmail || 'team@company.com',
        },
        dueDate: newDueDate || undefined,
      });
      setActionItems((prev) => [...prev, res.data.data]);
      setNewTask('');
      setNewOwnerName('');
      setNewOwnerEmail('');
      setNewDueDate('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add action item.');
    }
  };

  const handleUpdateActionItem = async (itemId: string, updates: Partial<ActionItem> & { progress?: number }) => {
    if (!id) return;
    try {
      const res = await api.patch(`/meetings/${id}/action-items/${itemId}`, updates);
      const updated = res.data?.data;
      setActionItems((prev) => prev.map((item) => (item._id === itemId ? { ...item, ...updates, ...updated } : item)));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update task.');
    }
  };

  const handleStartEditActionItem = (item: ActionItem) => {
    setEditingItemId(item._id);
    setEditTaskText(item.task);
    setEditOwnerName(item.owner?.name || '');
    setEditOwnerEmail(item.owner?.email || '');
    setEditDueDate(item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '');
    setEditStatus(item.status || 'open');
    setEditProgress(item.progress ?? (item.status === 'done' ? 100 : item.status === 'in_progress' ? 50 : 0));
  };

  const handleSaveActionItemEdit = async (itemId: string) => {
    await handleUpdateActionItem(itemId, {
      task: editTaskText,
      owner: {
        name: editOwnerName || 'Unassigned',
        email: editOwnerEmail || 'team@company.com',
      },
      dueDate: editDueDate || undefined,
      status: editStatus,
      progress: editProgress,
    });
    setEditingItemId(null);
  };

  const handleDeleteActionItem = async (itemId: string) => {
    if (!id || !window.confirm('Delete this action item?')) return;
    try {
      await api.delete(`/meetings/${id}/action-items/${itemId}`);
      setActionItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete action item.');
    }
  };

  // Send link to all users and participants
  const handleSendLinkToAllUsers = async () => {
    if (!id) return;
    setSharing(true);
    setShareSuccessMsg('');
    try {
      const res = await api.post(`/meetings/${id}/share`);
      const msg = res.data?.message || 'Meeting link sent to all participants & users!';
      setShareSuccessMsg(msg);
      setShareModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to broadcast meeting link.');
    } finally {
      setSharing(false);
    }
  };

  const handleCopyTranscript = () => {
    if (transcript?.fullText) {
      navigator.clipboard.writeText(transcript.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Opening meeting workspace...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
          {error || 'Meeting not found.'}
        </div>
        <button
          onClick={() => navigate('/meetings')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white"
        >
          Return to Meetings
        </button>
      </div>
    );
  }

  const isProcessing = meeting.status === 'processing';
  const hasAudio = !!meeting.audioUrl;

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={() => navigate('/meetings')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All Meetings
      </button>

      {/* Top Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                meeting.status === 'done'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : isProcessing
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {meeting.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {meeting.status === 'done' ? 'Speech-to-Text Ready' : isProcessing ? 'Transcribing Speech in Background...' : 'Awaiting Audio'}
              </span>

              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(meeting.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{meeting.title}</h1>
          </div>

          {/* Participants + Live Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-4 py-2.5 rounded-2xl">
              <Users className="w-4 h-4 text-emerald-400" />
              <div className="text-xs">
                <span className="font-semibold text-slate-200">{meeting.participants?.length || 0}</span>
                <span className="text-slate-400 ml-1">Participants</span>
              </div>
            </div>

            {/* Start Live Meeting button */}
            <button
              onClick={() => navigate(`/meetings/live/${meeting._id}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Video className="w-4 h-4" /> Go Live
            </button>

            {/* Copy invite link */}
            <button
              onClick={() => {
                const link = `${window.location.origin}/meetings/live/${meeting._id}`;
                navigator.clipboard.writeText(link);
                alert(`Invite link copied:\n${link}`);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            >
              <Link2 className="w-4 h-4" /> Copy Invite Link
            </button>

            {/* Send Link to All Users & Participants */}
            <button
              onClick={handleSendLinkToAllUsers}
              disabled={sharing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all hover:scale-105"
            >
              {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{sharing ? 'Sending...' : 'Send Link to All'}</span>
            </button>
          </div>
        </div>

        {/* Audio / Video Recording & Playback Section */}
        {hasAudio ? (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Meeting Media & Speech Recording</p>
                  <p className="text-xs text-slate-400">Recorded audio/video playback available below</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRecordedBlob(null);
                    setRecordedAudioUrl(null);
                    setMeeting((m: any) => ({ ...m, audioUrl: '' }));
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Record New Audio/Video
                </button>
              </div>
            </div>

            {meeting.audioUrl.endsWith('.mp4') || meeting.audioUrl.includes('video') ? (
              <video controls src={meeting.audioUrl} className="w-full max-h-80 rounded-2xl bg-black shadow-xl" />
            ) : (
              <audio controls src={meeting.audioUrl} className="w-full h-11 rounded-xl bg-slate-900" />
            )}
          </div>
        ) : isRecording ? (
          /* Live Recording in Progress */
          <div className="p-6 rounded-2xl bg-slate-950 border border-rose-500/40 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 animate-pulse">
                  {recordMediaType === 'video' ? <Camera className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <p className="text-sm font-bold text-white">
                      Recording {recordMediaType === 'video' ? 'Camera Video & Speech' : 'Microphone Speech'}
                    </p>
                  </div>
                  <p className="text-xs text-rose-300 font-mono mt-0.5 font-bold">
                    Elapsed Duration: {formatDuration(recordingDuration)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={stopRecording}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Recording ({formatDuration(recordingDuration)})</span>
              </button>
            </div>

            {/* Live Camera preview if recording video */}
            {recordMediaType === 'video' && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-64 mx-auto border border-slate-800">
                <video ref={liveVideoPreviewRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
            )}

            {/* Real-time live speech transcript display */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Live Speech-to-Text Recognition ({recordingLanguage}):
                </span>
                <span className="text-[11px] text-slate-500">Transcribing voice stream...</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans min-h-[40px] italic">
                {liveTranscript || 'Listening... Speak into your microphone now to see exact words appear here.'}
              </p>
            </div>
          </div>
        ) : recordedAudioUrl ? (
          /* Playback Preview & Confirmation Before Upload */
          <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                  {recordMediaType === 'video' ? <FileVideo className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Recorded {recordMediaType === 'video' ? 'Video' : 'Audio'} Playback & Review
                  </p>
                  <p className="text-xs text-cyan-300 font-mono font-semibold">
                    Length: {formatDuration(savedDuration || recordingDuration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecordedBlob(null);
                    setRecordedAudioUrl(null);
                    setLiveTranscript('');
                    finalTranscriptRef.current = '';
                  }}
                  disabled={audioUploading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Discard & Re-record
                </button>

                <button
                  type="button"
                  onClick={() => recordedBlob && uploadAudioBlob(recordedBlob, liveTranscript)}
                  disabled={audioUploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {audioUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{audioUploading ? 'Saving...' : 'Transcribe & Save Speech-to-Text'}</span>
                </button>
              </div>
            </div>

            {/* Video or Audio Player for playback */}
            {recordMediaType === 'video' ? (
              <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl">
                <video controls src={recordedAudioUrl} className="w-full max-h-72 object-contain bg-black" />
              </div>
            ) : (
              <audio controls src={recordedAudioUrl} className="w-full h-11 rounded-xl bg-slate-900" />
            )}

            {/* Captured Exact Speech-to-Text Review */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" /> Exact Transcribed Speech (from your voice recording):
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  className="text-[11px] text-cyan-400 hover:underline font-medium"
                >
                  {isEditingTranscript ? 'Done Editing' : 'Edit Text'}
                </button>
              </div>

              {isEditingTranscript ? (
                <textarea
                  value={liveTranscript}
                  onChange={(e) => setLiveTranscript(e.target.value)}
                  placeholder="Type or correct your speech transcript..."
                  rows={3}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              ) : (
                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 min-h-[40px]">
                  {liveTranscript || 'Speech recording ready. Click "Transcribe & Save Speech-to-Text" to save.'}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Initial Media Selection & Record Controls */
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-400" /> Record Microphone Speech or Video
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Audio & video are captured directly with real-time speech matching and playback review.
                </p>
              </div>

              {/* Mode & Language Selectors */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRecordMediaType('audio')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                      recordMediaType === 'audio'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" /> Audio
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordMediaType('video')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                      recordMediaType === 'video'
                        ? 'bg-violet-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" /> Video
                  </button>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs text-slate-300">
                  <Languages className="w-3.5 h-3.5 text-cyan-400" />
                  <select
                    value={recordingLanguage}
                    onChange={(e) => setRecordingLanguage(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="en-US" className="bg-slate-900 text-white">English (US)</option>
                    <option value="en-IN" className="bg-slate-900 text-white">English (India)</option>
                    <option value="hi-IN" className="bg-slate-900 text-white">Hindi (हिन्दी)</option>
                    <option value="ta-IN" className="bg-slate-900 text-white">Tamil (தமிழ்)</option>
                    <option value="es-ES" className="bg-slate-900 text-white">Spanish (Español)</option>
                    <option value="fr-FR" className="bg-slate-900 text-white">French (Français)</option>
                    <option value="de-DE" className="bg-slate-900 text-white">German (Deutsch)</option>
                    <option value="ja-JP" className="bg-slate-900 text-white">Japanese (日本語)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => startRecording(recordMediaType)}
                  disabled={audioUploading}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg ${
                    recordMediaType === 'video'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  {recordMediaType === 'video' ? <Camera className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{recordMediaType === 'video' ? 'Record Video' : 'Record Audio'}</span>
                </button>

                <label className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-all flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={audioUploading}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Processing Banner */}
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>
                <strong>Speech-to-Text Transcription:</strong> Speech is being transcribed in background. This page updates automatically.
              </span>
            </div>
            <button
              onClick={fetchMeetingData}
              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 transition-colors"
              title="Refresh now"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs — AI Summary removed, Speech-to-Text Transcript is primary */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('transcript')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'transcript'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Speech-to-Text Transcript
        </button>

        <button
          onClick={() => setActiveTab('decisions')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'decisions'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Decisions ({decisions.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'tasks'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Action Items ({actionItems.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 2: TRANSCRIPT */}
      {/* ===================================================================== */}
      {activeTab === 'transcript' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> Speech-to-Text Transcript
            </h2>

            {transcript?.fullText && (
              <button
                onClick={handleCopyTranscript}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            )}
          </div>

          {transcript?.fullText ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
              {/* Segments breakdown */}
              {transcript.segments && transcript.segments.length > 0 ? (
                <div className="space-y-4">
                  {transcript.segments.map((seg: TranscriptSegment, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-blue-400">{seg.speaker || `Speaker ${idx + 1}`}</span>
                        {seg.start !== undefined && (
                          <span className="font-mono">{Math.floor(seg.start)}s - {Math.floor(seg.end || 0)}s</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{seg.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {transcript.fullText}
                </p>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {isProcessing
                  ? 'Audio transcription is currently running...'
                  : 'No transcript available. Upload or record audio.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: DECISIONS */}
      {/* ===================================================================== */}
      {activeTab === 'decisions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-400" /> Decisions Agreed Upon
              </h2>
              <p className="text-xs text-slate-400">
                Formal outcomes and consensus made during the meeting. You can add, edit, or delete items.
              </p>
            </div>
          </div>

          {/* Add New Decision Form */}
          <form onSubmit={handleAddDecision} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex gap-3 shadow-lg">
            <input
              type="text"
              required
              value={newDecision}
              onChange={(e) => setNewDecision(e.target.value)}
              placeholder="Add a new decision agreed in this meeting..."
              className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!newDecision.trim()}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Decision
            </button>
          </form>

          {/* Decisions List */}
          {decisions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No decisions recorded yet. Add one above or let AI extract them.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {decisions.map((d) => (
                <div
                  key={d._id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/30 transition-all flex items-center justify-between gap-4 shadow-md"
                >
                  {editingDecisionId === d._id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingDecisionText}
                        onChange={(e) => setEditingDecisionText(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                      <button
                        onClick={() => handleSaveDecision(d._id)}
                        className="p-2 rounded-lg bg-emerald-600 text-white text-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingDecisionId(null)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold mt-0.5">
                          ✓
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">{d.text}</p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingDecisionId(d._id);
                            setEditingDecisionText(d.text);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDecision(d._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: ACTION ITEMS / TASK TRACKING */}
      {/* ===================================================================== */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-cyan-400" /> Action Items & Task Assignment
              </h2>
              <p className="text-xs text-slate-400">
                Track deliverables with owner assignment, status toggling, and automated reminders.
              </p>
            </div>
          </div>

          {/* Add Action Item Form */}
          <form onSubmit={handleAddActionItem} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Add New Action Item
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  required
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Task description (e.g. Update financial model by Friday)..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  placeholder="Owner Name (e.g. Sarah)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  placeholder="Owner Email (sarah@company.com)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!newTask.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Action Item
              </button>
            </div>
          </form>

          {/* Action Items List */}
          {actionItems.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No action items found. Add one above or run AI summary.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actionItems.map((item) => {
                const isEditing = editingItemId === item._id;
                const progress = item.progress ?? (item.status === 'done' ? 100 : item.status === 'in_progress' ? 50 : 0);

                if (isEditing) {
                  return (
                    <div
                      key={item._id}
                      className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/50 shadow-xl space-y-4 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5" /> Editing Action Item
                        </span>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="text-slate-400 hover:text-white text-xs"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Task</label>
                          <input
                            type="text"
                            value={editTaskText}
                            onChange={(e) => setEditTaskText(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Owner Name</label>
                            <input
                              type="text"
                              value={editOwnerName}
                              onChange={(e) => setEditOwnerName(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Owner Email</label>
                            <input
                              type="email"
                              value={editOwnerEmail}
                              onChange={(e) => setEditOwnerEmail(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Due Date</label>
                            <input
                              type="date"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Status</label>
                            <select
                              value={editStatus}
                              onChange={(e) => {
                                const s = e.target.value as any;
                                setEditStatus(s);
                                if (s === 'done') setEditProgress(100);
                                else if (s === 'open') setEditProgress(0);
                                else if (s === 'in_progress' && (editProgress === 0 || editProgress === 100)) setEditProgress(50);
                              }}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                              <span>Progress: {editProgress}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={editProgress}
                              onChange={(e) => {
                                const p = Number(e.target.value);
                                setEditProgress(p);
                                if (p === 100) setEditStatus('done');
                                else if (p > 0) setEditStatus('in_progress');
                                else setEditStatus('open');
                              }}
                              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-2"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveActionItemEdit(item._id)}
                            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item._id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            item.status === 'done'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : item.status === 'in_progress'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-950 text-slate-300 border border-slate-700'
                          }`}>
                            {item.status === 'in_progress' ? 'In Progress' : item.status}
                          </span>
                        </div>

                        <p className={`text-sm font-semibold ${item.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
                          {item.task}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-slate-300">
                            <User className="w-3 h-3 text-cyan-400" />
                            {item.owner?.name || 'Unassigned'} ({item.owner?.email || 'no email'})
                          </span>
                          {item.dueDate && (
                            <span className="flex items-center gap-1 text-slate-300 font-mono">
                              <Calendar className="w-3 h-3 text-emerald-400" />
                              Due: {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                        <button
                          onClick={() => handleStartEditActionItem(item)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                          title="Edit action item"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <select
                          value={item.status}
                          onChange={(e) => {
                            const status = e.target.value as any;
                            const prog = status === 'done' ? 100 : status === 'in_progress' ? 50 : 0;
                            handleUpdateActionItem(item._id, { status, progress: prog });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer transition-colors ${
                            item.status === 'done'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : item.status === 'in_progress'
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                              : 'bg-slate-950 border-slate-700 text-slate-300'
                          }`}
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>

                        <button
                          onClick={() => handleDeleteActionItem(item._id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Quick Adjust */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Progress</span>
                        <span className="font-bold font-mono text-cyan-400">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress === 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-cyan-500' : progress > 0 ? 'bg-amber-500' : 'bg-slate-700'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[0, 25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => {
                              const s: 'open' | 'in_progress' | 'done' =
                                pct === 100 ? 'done' : pct > 0 ? 'in_progress' : 'open';
                              handleUpdateActionItem(item._id, { progress: pct, status: s });
                            }}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                              progress === pct
                                ? 'bg-cyan-600 text-white'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Share / Send Link Modal */}
      {shareModalOpen && (
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
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {shareSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{shareSuccessMsg}</span>
              </div>
            )}

            {/* Links section */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  1. Live Meeting Room (Anyone with link can join)
                </label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/meetings/live/${meeting._id}`}
                    className="flex-1 bg-transparent text-xs text-white outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/meetings/live/${meeting._id}`);
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
                  2. Meeting Workspace (Summary, Transcript, Tasks)
                </label>
                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/meetings/${meeting._id}`}
                    className="flex-1 bg-transparent text-xs text-white outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/meetings/${meeting._id}`);
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
                onClick={() => setShareModalOpen(false)}
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
