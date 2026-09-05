import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Square, Upload, Loader2, AlertCircle, ArrowLeft,
  Volume2, Sparkles, FileAudio, Languages
} from 'lucide-react';
import api from '../../lib/api';

export default function NewMeeting() {
  const [title, setTitle] = useState('');
  const [participants, setParticipants] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  
  // Audio state
  const [mode, setMode] = useState<'record' | 'upload'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [savedDuration, setSavedDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  
  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const sessionFinalTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);
  const navigate = useNavigate();

  // Clean up timer & recognition on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const initLiveRecognition = (lang = language) => {
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
        let currentFinal = '';
        for (let i = 0; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += (currentFinal ? ' ' : '') + piece.trim();
          } else {
            interim += (interim ? ' ' : '') + piece.trim();
          }
        }
        sessionFinalTranscriptRef.current = currentFinal;
        const prefix = accumulatedTranscriptRef.current ? accumulatedTranscriptRef.current + ' ' : '';
        const combined = (prefix + (currentFinal ? currentFinal + ' ' : '') + interim).trim();
        if (combined) {
          setLiveTranscript(combined);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('[NewMeeting STT] status:', e.error);
      };

      rec.onend = () => {
        if (sessionFinalTranscriptRef.current) {
          accumulatedTranscriptRef.current = (
            (accumulatedTranscriptRef.current ? accumulatedTranscriptRef.current + ' ' : '') + 
            sessionFinalTranscriptRef.current
          ).trim();
          sessionFinalTranscriptRef.current = '';
        }
        if (isRecordingRef.current) {
          setTimeout(() => {
            if (isRecordingRef.current) initLiveRecognition(lang);
          }, 100);
        }
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.warn('[NewMeeting STT] failed:', e);
    }
  };

  const startRecording = async () => {
    setError('');
    try {
      setAudioBlob(null);
      setAudioUrl(null);
      setLiveTranscript('');
      accumulatedTranscriptRef.current = '';
      sessionFinalTranscriptRef.current = '';
      isRecordingRef.current = true;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);
      setSavedDuration(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const next = prev + 1;
          setSavedDuration(next);
          return next;
        });
      }, 1000);

      initLiveRecognition(language);
    } catch (err: any) {
      setError('Microphone access denied. Please grant permissions or upload an audio file.');
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
      if (sessionFinalTranscriptRef.current) {
        accumulatedTranscriptRef.current = (
          (accumulatedTranscriptRef.current ? accumulatedTranscriptRef.current + ' ' : '') + 
          sessionFinalTranscriptRef.current
        ).trim();
        sessionFinalTranscriptRef.current = '';
        if (accumulatedTranscriptRef.current) {
          setLiveTranscript(accumulatedTranscriptRef.current);
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a meeting title.');
      return;
    }

    const hasAudio = mode === 'record' ? !!audioBlob : !!selectedFile;
    if (!hasAudio) {
      setError('Please record audio or select an audio file to upload.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Create meeting
      const parts = participants
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => ({ name: p.split('@')[0], email: p }));

      const createRes = await api.post('/meetings', {
        title,
        participants: parts,
        scheduledAt: scheduledAt || undefined,
      });

      const meetingId = createRes.data?.data?._id;

      // 2. Upload audio file with exact transcript
      const formData = new FormData();
      if (mode === 'record' && audioBlob) {
        formData.append('audio', audioBlob, `meeting_${meetingId}.webm`);
      } else if (selectedFile) {
        formData.append('audio', selectedFile);
      }

      if (liveTranscript && liveTranscript.trim()) {
        formData.append('transcriptText', liveTranscript.trim());
      }

      await api.post(`/meetings/${meetingId}/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 3. Navigate to meeting detail to see async processing
      navigate(`/meetings/${meetingId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to process meeting audio.');
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 text-white max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={() => navigate('/meetings')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Meetings Directory
      </button>

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Mic className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Live Audio Recording & Ingestion
          </span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Record or Upload Meeting</h1>
        <p className="text-slate-400 text-sm mt-1">
          Capture conversation in high fidelity. The system automatically performs Whisper speech-to-text, creates summaries, and extracts decisions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Metadata Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>1. Meeting Information</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Roadmap Review & Marketing Alignment"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Participants (Emails comma separated)
              </label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="alice@company.com, bob@company.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Scheduled Date & Time (Optional)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Audio Input Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Capture Audio Source
            </h2>
            
            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setMode('record')}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  mode === 'record'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" /> Live Microphone
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  mode === 'upload'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> File Upload
              </button>
            </div>
          </div>

          {/* Record Mode */}
          {mode === 'record' && (
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-5">
              {/* Pulsing visualizer button */}
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                )}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                    isRecording
                      ? 'bg-rose-600 text-white shadow-rose-600/50 hover:scale-105'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/40 hover:scale-105'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 fill-current" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">Language:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="en-US" className="bg-slate-900 text-white">English (US)</option>
                  <option value="en-IN" className="bg-slate-900 text-white">English (India)</option>
                  <option value="hi-IN" className="bg-slate-900 text-white">Hindi (हिन्दी)</option>
                  <option value="ta-IN" className="bg-slate-900 text-white">Tamil (தமிழ்)</option>
                  <option value="es-ES" className="bg-slate-900 text-white">Spanish (Español)</option>
                  <option value="fr-FR" className="bg-slate-900 text-white">French (Français)</option>
                  <option value="de-DE" className="bg-slate-900 text-white">German (Deutsch)</option>
                </select>
              </div>

              {/* Timer / Status */}
              <div>
                <div className="text-3xl font-mono font-bold tracking-tight text-white">
                  {formatDuration(savedDuration || recordingDuration)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isRecording
                    ? '🔴 Recording in progress... Speak now and click the stop button when done'
                    : audioBlob
                    ? `✅ Audio recorded successfully (${formatDuration(savedDuration)})! Preview below & submit to transcribe.`
                    : 'Click microphone button to begin in-browser recording'}
                </p>
              </div>

              {/* Live Speech Recognition Display */}
              {isRecording && (
                <div className="w-full max-w-lg p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Live Speech Recognition:
                  </span>
                  <p className="text-xs text-slate-200 italic min-h-[28px]">
                    {liveTranscript || 'Listening to your voice...'}
                  </p>
                </div>
              )}

              {/* Live Audio Waves Simulation */}
              {isRecording && (
                <div className="flex items-end justify-center h-12 gap-1.5 px-4 w-full max-w-sm">
                  {[30, 70, 45, 90, 60, 100, 80, 50, 95, 40, 85, 65, 90, 40, 75, 95].map((h, i) => (
                    <div
                      key={i}
                      className="w-2 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full animate-pulse"
                      style={{ height: `${h}%`, animationDuration: `${0.4 + (i % 5) * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div className="p-8 rounded-3xl bg-slate-950 border border-dashed border-slate-800 hover:border-emerald-500/40 flex flex-col items-center justify-center text-center space-y-4 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileAudio className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {selectedFile ? selectedFile.name : 'Drag and drop or select meeting audio'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports MP3, WAV, M4A, WEBM, FLAC (up to 200MB)
                </p>
              </div>

              <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer transition-all">
                Browse Files
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.flac"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Live Speech Recognition & Captured Transcript Review */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Exact Speech-to-Text Transcript (Editable)
              </span>
              <span className="text-[11px] text-slate-400">
                {isRecording ? '🔴 Listening in real time...' : 'You can review or manually edit this transcript before saving'}
              </span>
            </div>

            <textarea
              value={liveTranscript}
              onChange={(e) => setLiveTranscript(e.target.value)}
              placeholder={
                isRecording
                  ? 'Listening to microphone... Words will appear here in real time.'
                  : 'Spoken words from recording will appear here. You can also type or refine the transcript text directly.'
              }
              rows={4}
              className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
            />

            {audioUrl && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" /> Audio Playback ({formatDuration(savedDuration)})
                </span>
                <audio controls src={audioUrl} className="w-full sm:w-80 h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving Audio & Speech-to-Text Transcript...</span>
            </>
          ) : (
            <>
              <FileAudio className="w-5 h-5" />
              <span>Save Audio & Speech-to-Text Transcript</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
