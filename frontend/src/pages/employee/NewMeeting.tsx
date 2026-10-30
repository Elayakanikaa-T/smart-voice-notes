import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Square, Upload, Loader2, AlertCircle, ArrowLeft,
  Sparkles, FileAudio, Languages, Wand2
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
  const [isTranscribingWithAI, setIsTranscribingWithAI] = useState(false);
  const [sttStatus, setSttStatus] = useState<'idle' | 'listening' | 'unsupported' | 'error'>('idle');
  const [sttError, setSttError] = useState('');
  
  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isRecognizingRef = useRef<boolean>(false);
  const isAbortingRef = useRef<boolean>(false);
  const baseSavedTranscriptRef = useRef<string>('');
  const currentSessionTranscriptRef = useRef<string>('');
  const navigate = useNavigate();

  // Clean up timer & recognition on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      isAbortingRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const initLiveRecognition = (lang = language) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSttStatus('unsupported');
      setSttError('Speech-to-text not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      if (isRecognizingRef.current && recognitionRef.current) {
        isAbortingRef.current = true;
        try { recognitionRef.current.abort(); } catch {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang;

      rec.onstart = () => {
        isRecognizingRef.current = true;
        isAbortingRef.current = false;
        setSttStatus('listening');
        setSttError('');
      };

      rec.onresult = (event: any) => {
        let sessionText = '';
        for (let i = 0; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (piece) {
            sessionText += (sessionText ? ' ' : '') + piece.trim();
          }
        }
        currentSessionTranscriptRef.current = sessionText;
        const prefix = baseSavedTranscriptRef.current ? baseSavedTranscriptRef.current + ' ' : '';
        const combined = (prefix + sessionText).trim();
        if (combined) {
          setLiveTranscript(combined);
        }
      };

      rec.onerror = (e: any) => {
        if (e.error === 'no-speech' || e.error === 'aborted') {
          // Normal benign events
          return;
        }
        console.warn('[NewMeeting STT] error:', e.error);
        if (e.error === 'not-allowed') {
          setSttStatus('error');
          setSttError('Microphone permission denied for speech recognition.');
        } else if (e.error === 'network') {
          setSttStatus('error');
          setSttError('Network error — speech recognition needs internet connection.');
        } else {
          setSttStatus('error');
          setSttError(`Speech recognition: ${e.error}`);
        }
      };

      rec.onend = () => {
        isRecognizingRef.current = false;
        if (currentSessionTranscriptRef.current) {
          baseSavedTranscriptRef.current = (
            (baseSavedTranscriptRef.current ? baseSavedTranscriptRef.current + ' ' : '') + 
            currentSessionTranscriptRef.current
          ).trim();
          currentSessionTranscriptRef.current = '';
        }

        // Only restart if recording is still active and not explicitly aborted
        if (isRecordingRef.current && !isAbortingRef.current) {
          setTimeout(() => {
            if (isRecordingRef.current && !isAbortingRef.current && !isRecognizingRef.current) {
              try { rec.start(); } catch {}
            }
          }, 200);
        }
      };

      isAbortingRef.current = false;
      rec.start();
      recognitionRef.current = rec;
    } catch (e: any) {
      setSttStatus('error');
      setSttError(`Could not initialize speech recognition: ${e.message || e}`);
    }
  };

  const startRecording = async () => {
    setError('');
    try {
      setAudioBlob(null);
      setAudioUrl(null);
      setLiveTranscript('');
      baseSavedTranscriptRef.current = '';
      currentSessionTranscriptRef.current = '';
      isRecordingRef.current = true;
      isAbortingRef.current = false;
      setSttStatus('idle');
      setSttError('');

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
      setError('Microphone access denied. Please grant permissions or upload an audio recording.');
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    isAbortingRef.current = true;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (currentSessionTranscriptRef.current) {
        baseSavedTranscriptRef.current = (
          (baseSavedTranscriptRef.current ? baseSavedTranscriptRef.current + ' ' : '') + 
          currentSessionTranscriptRef.current
        ).trim();
        currentSessionTranscriptRef.current = '';
      }
      if (baseSavedTranscriptRef.current) {
        setLiveTranscript(baseSavedTranscriptRef.current);
      }
    }
  };

  const handleTranscribeWithAI = async () => {
    const targetAudio = mode === 'record' ? audioBlob : selectedFile;
    if (!targetAudio) return;
    setIsTranscribingWithAI(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('audio', targetAudio, 'meeting_audio.webm');
      formData.append('language', language);
      formData.append('title', title || 'Meeting Recording');

      const { data } = await api.post('/transcription/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.data?.transcript || data.data?.rawText) {
        const transcriptText = data.data.transcript || data.data.rawText;
        setLiveTranscript(transcriptText);
        baseSavedTranscriptRef.current = transcriptText;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'AI transcription completed with default transcript.');
    } finally {
      setIsTranscribingWithAI(false);
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
      // 1. Create meeting entry
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

      // 2. Upload audio file and transcript directly
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

      // 3. Immediately route to meeting detail
      navigate(`/meetings/${meetingId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to process and save meeting audio.');
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 text-slate-100 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate('/meetings')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Meetings Directory
      </button>

      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Mic className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Live Voice Ingestion & Meeting Recording
          </span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Record or Upload Meeting</h1>
        <p className="text-slate-400 text-sm mt-1">
          Capture speech in real time or ingest recordings. The system automatically performs speech-to-text, compiles executive summaries, and extracts action items.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Metadata Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>1. Meeting Information</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Strategic Planning & Roadmap Alignment"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Participants (Emails separated by commas)
              </label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="alice@company.com, bob@company.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Date & Time (Optional)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Audio Input Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Capture Audio Source
            </h2>
            
            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setMode('record')}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'record'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" /> Live Microphone
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'upload'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
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
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                )}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white shadow-rose-600/50 hover:scale-105'
                      : 'bg-indigo-600 text-white shadow-indigo-600/40 hover:scale-105'
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
                <Languages className="w-3.5 h-3.5 text-indigo-400" />
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
                </select>
              </div>

              {/* Timer / Status */}
              <div>
                <div className="text-3xl font-mono font-bold tracking-tight text-white">
                  {formatDuration(savedDuration || recordingDuration)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isRecording
                    ? '🔴 Recording in progress... Speak into microphone and click Stop when finished.'
                    : audioBlob
                    ? `✅ Audio captured (${formatDuration(savedDuration)}). Review transcript below and save.`
                    : 'Click microphone button to begin in-browser recording.'}
                </p>
              </div>

              {/* Live Speech Recognition Box */}
              {isRecording && (
                <div className="w-full max-w-lg p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-1">
                  <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Live Speech Recognition:
                  </span>
                  {sttStatus === 'listening' && (
                    <p className="text-xs text-slate-200 italic min-h-[28px]">
                      {liveTranscript || 'Listening to your speech...'}
                    </p>
                  )}
                  {sttStatus === 'idle' && (
                    <p className="text-xs text-slate-400 min-h-[28px]">
                      Starting microphone transcription...
                    </p>
                  )}
                  {(sttStatus === 'unsupported' || sttStatus === 'error') && (
                    <p className="text-xs text-rose-400 min-h-[28px]">
                      ⚠️ {sttError || 'Speech recognition not active.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div className="p-8 rounded-3xl bg-slate-950 border border-dashed border-slate-800 hover:border-indigo-500/50 flex flex-col items-center justify-center text-center space-y-4 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileAudio className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {selectedFile ? selectedFile.name : 'Select or drop meeting recording file'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports MP3, WAV, M4A, WEBM, FLAC (up to 200MB)
                </p>
              </div>

              <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer transition-all">
                Browse Files
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.flac,.mp4"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Captured Transcript Review */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-indigo-400 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Speech-to-Text Transcript (Editable)
              </span>
              <div className="flex items-center gap-2">
                {(audioBlob || selectedFile) && !isRecording && (
                  <button
                    type="button"
                    onClick={handleTranscribeWithAI}
                    disabled={isTranscribingWithAI}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-lg text-indigo-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isTranscribingWithAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    <span>{isTranscribingWithAI ? 'Transcribing...' : 'Run Speech-to-Text'}</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={liveTranscript}
              onChange={(e) => setLiveTranscript(e.target.value)}
              placeholder={
                isRecording
                  ? 'Microphone active... Words will appear here in real time.'
                  : 'Spoken text will appear here. You can also edit or refine the transcript directly.'
              }
              rows={4}
              className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
            />

            {audioUrl && (
              <div className="pt-2">
                <audio controls src={audioUrl} className="w-full h-10 rounded-xl bg-slate-900" />
              </div>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/meetings')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={submitting || (!audioBlob && !selectedFile)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{submitting ? 'Saving Meeting & Audio...' : 'Save & Ingest Meeting'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
