import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Loader2, CheckCircle, FileAudio, Trash2, Play, Pause, Sparkles, Languages, Wand2 } from 'lucide-react';
import api from '../../lib/api';

interface Subject { id: string; name: string; }

type RecordState = 'idle' | 'recording' | 'stopped' | 'uploading' | 'done';

export default function RecordAudio() {
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [title, setTitle] = useState('');
  const [timer, setTimer] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [isTranscribingWithAI, setIsTranscribingWithAI] = useState(false);
  const [sttStatus, setSttStatus] = useState<'idle' | 'listening' | 'unsupported' | 'error'>('idle');
  const [sttError, setSttError] = useState('');
  const [result, setResult] = useState<{ noteId: string; transcript?: string } | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const baseSavedTranscriptRef = useRef<string>('');
  const currentSessionTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

  useEffect(() => {
    api.get('/subjects').then(({ data }) => {
      const subs = data.data?.subjects || data.data || [];
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubject(subs[0].id);
    }).catch(() => {});
    return () => { 
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const initRecognition = (lang = language) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSttStatus('unsupported');
      setSttError('Speech-to-text not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = lang;

      recognition.onstart = () => {
        setSttStatus('listening');
        setSttError('');
      };

      recognition.onresult = (event: any) => {
        setSttStatus('listening');
        let fullSessionText = '';
        for (let i = 0; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (piece) {
            fullSessionText += (fullSessionText ? ' ' : '') + piece.trim();
          }
        }
        currentSessionTranscriptRef.current = fullSessionText;
        const prefix = baseSavedTranscriptRef.current ? baseSavedTranscriptRef.current + ' ' : '';
        const combined = (prefix + fullSessionText).trim();
        if (combined) {
          setLiveTranscript(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[SpeechRecognition] event status:', event.error);
        if (event.error === 'not-allowed') {
          setSttStatus('error');
          setSttError('Microphone permission denied for speech recognition. Please allow it in browser settings.');
        } else if (event.error === 'network') {
          setSttStatus('error');
          setSttError('Network error — speech-to-text requires internet connection.');
        } else if (event.error === 'no-speech') {
          // No speech detected — this is normal, just keep listening
        } else {
          setSttStatus('error');
          setSttError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (currentSessionTranscriptRef.current) {
          baseSavedTranscriptRef.current = (
            (baseSavedTranscriptRef.current ? baseSavedTranscriptRef.current + ' ' : '') +
            currentSessionTranscriptRef.current
          ).trim();
          currentSessionTranscriptRef.current = '';
        }
        if (isRecordingRef.current) {
          setTimeout(() => {
            if (isRecordingRef.current) {
              initRecognition(lang);
            }
          }, 150);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e: any) {
      setSttStatus('error');
      setSttError(`Failed to start speech recognition: ${e.message || e}`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(250);
      mediaRef.current = mr;
      isRecordingRef.current = true;
      baseSavedTranscriptRef.current = '';
      currentSessionTranscriptRef.current = '';
      setRecordState('recording');
      setTimer(0);
      setLiveTranscript('');
      setSttStatus('idle');
      setSttError('');
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000) as unknown as number;

      // Start continuous speech recognition
      initRecognition(language);
    } catch { 
      alert('Microphone access denied. Please allow microphone permission in your browser.'); 
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    mediaRef.current?.stop();
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
    setRecordState('stopped');
  };

  const handleTranscribeWithAI = async () => {
    if (!audioBlob) return;
    setIsTranscribingWithAI(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'student_recording.webm');
      formData.append('language', language);
      formData.append('title', title || 'Lecture Recording');

      const { data } = await api.post('/transcription/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.data?.transcript) {
        setLiveTranscript(data.data.transcript);
        baseSavedTranscriptRef.current = data.data.transcript;
      }
    } catch (err: any) {
      console.warn('Backend AI transcription error:', err);
    } finally {
      setIsTranscribingWithAI(false);
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !selectedSubject) {
      alert('Please enter a note / topic title and select a subject.');
      return;
    }
    if (!liveTranscript.trim() && !audioBlob) {
      alert('Please speak or record some audio before saving.');
      return;
    }

    setRecordState('uploading');
    try {
      let finalNoteId = '';
      let finalTranscript = liveTranscript.trim();

      if (audioBlob) {
        // Create audio note entry
        const initRes = await api.post('/notes', {
          subjectId: selectedSubject,
          title: title.trim(),
          durationSeconds: timer,
        });
        
        finalNoteId = initRes.data.data?.noteId || initRes.data.data?.id || initRes.data.data?._id;

        const formData = new FormData();
        formData.append('audio', audioBlob, `${finalNoteId}.webm`);
        if (finalTranscript) {
          formData.append('transcriptText', finalTranscript);
        }
        
        await api.post(`/notes/${finalNoteId}/upload-audio`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

      } else {
        // Text note flow
        const { data: resData } = await api.post('/notes/text', {
          subjectId: selectedSubject,
          topic: title.trim(),
          title: title.trim(),
          content: finalTranscript,
        });
        finalNoteId = resData.data?.id || resData.data?._id || resData.data?.noteId;
      }

      setResult({ 
        noteId: finalNoteId, 
        transcript: finalTranscript || 'Your audio has been saved and speech-to-text transcript is ready.' 
      });
      setRecordState('done');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save note. Please try again.');
      setRecordState('stopped');
    }
  };

  const reset = () => {
    setRecordState('idle');
    setAudioBlob(null);
    setAudioUrl('');
    setTimer(0);
    setTitle('');
    setLiveTranscript('');
    baseSavedTranscriptRef.current = '';
    currentSessionTranscriptRef.current = '';
    setResult(null);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="p-6 text-white max-w-3xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mic className="w-6 h-6 text-blue-400" />
          Record Audio Lecture & Voice Note
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Speak your thoughts or record lectures. Audio is transcribed in real-time with continuous speech-to-text and AI study takeaways.
        </p>
      </div>

      {recordState === 'done' && result ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4 animate-in fade-in">
          <CheckCircle size={56} className="text-emerald-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Voice Note Captured Successfully!</h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Your audio and speech-to-text transcript are stored. AI extracted key points and flashcards have been prepared for your revision.
          </p>
          
          {result.transcript && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left text-xs text-slate-300 max-h-40 overflow-y-auto">
              <span className="font-bold text-emerald-400 block mb-1">📝 Transcribed Speech-to-Text Content:</span>
              {result.transcript}
            </div>
          )}

          <div className="flex gap-3 justify-center pt-2">
            <button onClick={reset} className="rounded-xl bg-slate-800 px-6 py-2.5 font-semibold text-white hover:bg-slate-700 transition-colors">
              Record Another
            </button>
            <a href="/student/notes" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-semibold text-white hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all">
              View in My Notes
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Note Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">Note Title *</label>
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                disabled={recordState === 'uploading'}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Binary Search Trees & In-Order Traversal" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">Subject *</label>
              <select 
                value={selectedSubject} 
                onChange={e => setSelectedSubject(e.target.value)}
                disabled={recordState === 'uploading'}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                {subjects.length === 0 && <option value="">Core Subject</option>}
              </select>
            </div>
          </div>

          {/* Recorder Controls */}
          <div className="flex flex-col items-center py-8 border border-dashed border-slate-700/80 rounded-2xl bg-slate-950/40">
            
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 mb-5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={recordState === 'recording'}
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

            {/* Waveform animation */}
            {recordState === 'recording' && (
              <div className="flex items-end gap-1.5 mb-6 h-12">
                {[...Array(16)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 rounded-full bg-gradient-to-t from-blue-600 to-indigo-400 animate-pulse"
                    style={{ 
                      height: `${16 + Math.random() * 32}px`, 
                      animationDelay: `${i * 0.08}s`, 
                      animationDuration: `${0.4 + Math.random() * 0.4}s` 
                    }} 
                  />
                ))}
              </div>
            )}
            {recordState !== 'recording' && (
              <div className="mb-6 rounded-full bg-slate-800 p-6 shadow-inner">
                <FileAudio size={40} className="text-slate-500" />
              </div>
            )}
            
            <div className="text-4xl font-mono font-bold text-white mb-4 tracking-wider">{fmtTime(timer)}</div>

            <div className="flex items-center gap-4">
              {recordState === 'idle' && (
                <button 
                  onClick={startRecording}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-red-600/30 hover:scale-105 transition-all"
                >
                  <Mic size={20} /> Start Recording
                </button>
              )}
              {recordState === 'recording' && (
                <button 
                  onClick={stopRecording}
                  className="flex items-center gap-2 rounded-full bg-slate-700 hover:bg-slate-600 px-8 py-3.5 font-bold text-white border border-slate-600 shadow-lg transition-all"
                >
                  <Square size={20} className="text-red-400 fill-current" /> Stop Recording
                </button>
              )}
            </div>
          </div>

          {/* Live Speech-to-Text Transcript Output */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Live Speech-to-Text Transcript (Editable)
              </span>
              <div className="flex items-center gap-2">
                {recordState === 'recording' && sttStatus === 'listening' && (
                  <span className="text-emerald-400 flex items-center gap-1 animate-pulse">
                    ● Listening & Transcribing...
                  </span>
                )}
                {recordState === 'recording' && sttStatus === 'idle' && (
                  <span className="text-yellow-400 flex items-center gap-1 animate-pulse">
                    ● Starting speech recognition...
                  </span>
                )}
                {recordState === 'stopped' && audioBlob && (
                  <button
                    type="button"
                    onClick={handleTranscribeWithAI}
                    disabled={isTranscribingWithAI}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 rounded-lg text-indigo-300 text-[11px] font-bold transition-colors"
                  >
                    {isTranscribingWithAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    <span>{isTranscribingWithAI ? 'Transcribing...' : 'AI Transcribe Audio'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Show STT errors/warnings */}
            {(sttStatus === 'unsupported' || sttStatus === 'error') && sttError && (
              <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{sttError}</span>
              </div>
            )}

            <textarea
              value={liveTranscript}
              onChange={(e) => {
                setLiveTranscript(e.target.value);
                baseSavedTranscriptRef.current = e.target.value;
              }}
              placeholder={recordState === 'recording' ? 'Speak now... your words will appear here in real-time.' : 'Speech-to-text transcript will appear here when you record. You can also type or edit text directly.'}
              className="w-full h-28 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-sm text-slate-200 resize-none focus:outline-none focus:border-blue-500 placeholder-slate-600 leading-relaxed font-sans"
            />
          </div>

          {/* Playback & Upload */}
          {recordState === 'stopped' && audioUrl && (
            <div className="space-y-4 pt-2">
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
              <div className="flex items-center gap-3 rounded-2xl bg-slate-950 border border-slate-800 p-4">
                <button 
                  onClick={togglePlay} 
                  className="flex-shrink-0 rounded-full bg-blue-600 p-3 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Audio Recording ({fmtTime(timer)})</p>
                  <p className="text-xs text-slate-400">Ready to save & generate AI notes</p>
                </div>
                <button onClick={reset} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              <button 
                onClick={handleUpload}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white hover:opacity-95 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01]"
              >
                <Upload size={18} /> Save Note & Generate AI Structured Content
              </button>
            </div>
          )}

          {recordState === 'uploading' && (
            <div className="flex flex-col items-center py-6 gap-3 text-blue-400">
              <Loader2 size={32} className="animate-spin" />
              <p className="font-semibold text-sm">Processing audio with Gemini / Whisper AI...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

