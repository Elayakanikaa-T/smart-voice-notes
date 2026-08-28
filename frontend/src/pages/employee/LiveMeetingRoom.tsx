import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Settings, MessageSquare, 
  Circle, Square, Play, Download, Save, X, Check, Loader2, FileVideo 
} from 'lucide-react';
import api from '../../lib/api';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

interface LiveTranscriptChunk {
  text: string;
  userName: string;
  isFinal: boolean;
  language: string;
}

export const LiveMeetingRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // A/V State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Participants & Transcripts
  const [participants, setParticipants] = useState<{ socketId: string, userName: string }[]>([]);
  const [transcripts, setTranscripts] = useState<{ userName: string; text: string; translatedText?: string }[]>([]);
  
  // Speech Recognition
  const recognitionRef = useRef<any>(null);
  const [language, setLanguage] = useState('en-US');
  const [userName] = useState(() => localStorage.getItem('guestName') || 'Employee');

  // Video Recording & Playback State
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [savedVideoDuration, setSavedVideoDuration] = useState(0);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [showPlaybackModal, setShowPlaybackModal] = useState(false);
  const [savingRecording, setSavingRecording] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  useEffect(() => {
    // 1. Setup Local Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(err => console.error("Error accessing media devices.", err));

    // 2. Setup Socket
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-meeting', id, userName);
    });

    newSocket.on('user-joined', (user) => {
      setParticipants(prev => [...prev.filter(p => p.socketId !== user.socketId), user]);
    });

    newSocket.on('transcript-update', (data: LiveTranscriptChunk) => {
      if (data.isFinal) {
        setTranscripts(prev => [...prev, { userName: data.userName, text: data.text }]);
      }
    });

    newSocket.on('translated-transcript-update', (data: { userName: string, translatedText: string, originalText: string }) => {
      setTranscripts(prev => [...prev, { userName: data.userName, text: data.originalText, translatedText: data.translatedText }]);
    });

    return () => {
      newSocket.disconnect();
      stream?.getTracks().forEach(t => t.stop());
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [id, userName]);

  // 3. Web Speech API STT
  useEffect(() => {
    if (!socket || !stream || isMuted) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language;
    recognitionRef.current = recognition;

    recognition.onresult = async (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const text = result[0].transcript;
        
        // Show locally instantly
        setTranscripts(prev => [...prev, { userName: 'You', text }]);
        
        // If non-English, translate via backend before broadcasting
        if (!language.startsWith('en')) {
          try {
            const res = await fetch(`${SOCKET_URL}/api/v1/translate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, sourceLanguage: language })
            });
            const data = await res.json();
            if (data.success) {
              const translated = data.data.translatedText;
              setTranscripts(prev => {
                const latest = [...prev];
                latest[latest.length - 1].translatedText = translated;
                return latest;
              });
              socket.emit('translation-update', { meetingId: id, originalText: text, translatedText: translated, userName, isFinal: true });
            }
          } catch (e) {
            console.error("Translation failed", e);
            socket.emit('live-transcript-chunk', { meetingId: id, text, userName, isFinal: true, language });
          }
        } else {
           socket.emit('live-transcript-chunk', { meetingId: id, text, userName, isFinal: true, language });
        }
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [socket, isMuted, language]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  // Video Recording Controls
  const startVideoRecording = () => {
    if (!stream) return;
    try {
      videoChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      videoRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: mimeType });
        setRecordedVideoBlob(blob);
        setRecordedVideoUrl(URL.createObjectURL(blob));
        setShowPlaybackModal(true);
      };

      recorder.start(250);
      setIsRecordingVideo(true);
      setRecordingSeconds(0);
      setSavedVideoDuration(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds(p => {
          const next = p + 1;
          setSavedVideoDuration(next);
          return next;
        });
      }, 1000);
    } catch (e: any) {
      alert('Could not record meeting video: ' + e.message);
    }
  };

  const stopVideoRecording = () => {
    if (videoRecorderRef.current && isRecordingVideo) {
      videoRecorderRef.current.stop();
      setIsRecordingVideo(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const handleSaveVideoToMeeting = async () => {
    if (!id || !recordedVideoBlob) return;
    setSavingRecording(true);
    try {
      const fullTranscriptText = transcripts.map(t => `${t.userName}: ${t.text}`).join('\n');
      const formData = new FormData();
      formData.append('audio', recordedVideoBlob, 'meeting_live_video.webm');
      if (fullTranscriptText) {
        formData.append('transcriptText', fullTranscriptText);
      }

      await api.post(`/meetings/${id}/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setShowPlaybackModal(false);
        navigate(`/meetings/${id}`);
      }, 1500);
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to upload recorded video.');
    } finally {
      setSavingRecording(false);
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
      {/* Video Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 p-4 grid grid-cols-2 gap-4 auto-rows-fr">
          {/* Local User */}
          <div className="relative bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-700">
            <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} />
            {isVideoOff && <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-3xl font-bold">{userName.charAt(0)}</div>}
            
            {/* Overlay Badges */}
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
              {isMuted && <MicOff className="w-3.5 h-3.5 text-red-500" />} {userName} (You)
            </div>

            {isRecordingVideo && (
              <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                REC {formatSecs(recordingSeconds)}
              </div>
            )}
          </div>
          
          {/* Remote Participants */}
          {participants.map(p => (
             <div key={p.socketId} className="relative bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700">
               <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold">{p.userName.charAt(0)}</div>
               <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-xs">{p.userName}</div>
             </div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="h-20 bg-gray-950 border-t border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-gray-400" />
            <select 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
              className="bg-gray-800 border-none rounded-xl text-xs py-1.5 px-3 focus:ring-0 text-gray-200"
            >
              <option value="en-US">English (US)</option>
              <option value="es-ES">Spanish</option>
              <option value="ta-IN">Tamil</option>
              <option value="fr-FR">French</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMute} 
              className={`p-3.5 rounded-2xl transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={toggleVideo} 
              className={`p-3.5 rounded-2xl transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* Video Recording Button */}
            <button
              onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                isRecordingVideo
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              {isRecordingVideo ? <Square className="w-4 h-4 fill-current" /> : <Circle className="w-4 h-4 fill-current text-rose-400" />}
              <span>{isRecordingVideo ? `Stop REC (${formatSecs(recordingSeconds)})` : 'Record Video'}</span>
            </button>
            
            <button 
              onClick={() => {
                if (isRecordingVideo) stopVideoRecording();
                else navigate(`/meetings/${id}`);
              }} 
              className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-all"
              title="Leave Room"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {recordedVideoUrl && (
              <button
                onClick={() => setShowPlaybackModal(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> Video Playback
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Transcript Sidebar */}
      <div className="w-80 bg-gray-950 border-l border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h2 className="font-semibold text-base">Live Speech Transcript</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {transcripts.map((t, idx) => (
            <div key={idx} className="bg-gray-900 p-3 rounded-xl border border-gray-800">
              <div className="text-xs font-semibold text-cyan-400 mb-1">{t.userName}</div>
              <div className="text-xs text-gray-200 leading-relaxed">{t.text}</div>
              {t.translatedText && (
                <div className="text-xs text-indigo-300 mt-2 pt-2 border-t border-gray-800 italic">
                  {t.translatedText}
                </div>
              )}
            </div>
          ))}
          {transcripts.length === 0 && (
             <div className="text-gray-500 text-xs text-center mt-10">Start speaking to see exact speech-to-text live...</div>
          )}
        </div>
      </div>

      {/* Recorded Meeting Video Playback Modal */}
      {showPlaybackModal && recordedVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                  <FileVideo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recorded Meeting Video Playback</h3>
                  <p className="text-xs text-slate-400">Duration: {formatSecs(savedVideoDuration || recordingSeconds)}</p>
                </div>
              </div>
              <button onClick={() => setShowPlaybackModal(false)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800">
              <video controls src={recordedVideoUrl} className="w-full h-full object-contain bg-black" />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href={recordedVideoUrl}
                download="recorded_meeting_video.webm"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Video
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPlaybackModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveVideoToMeeting}
                  disabled={savingRecording || savedSuccess}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  {savingRecording ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? 'Saved & Redirecting...' : savingRecording ? 'Saving...' : 'Save to Workspace'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
