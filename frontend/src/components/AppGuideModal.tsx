import { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Mic, 
  Video, 
  Share2, 
  GraduationCap, 
  Briefcase, 
  ShieldAlert, 
  Sparkles
} from 'lucide-react';

interface AppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'student' | 'employee';
}

export default function AppGuideModal({ isOpen, onClose, initialRole = 'student' }: AppGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'employee' | 'tips'>(initialRole);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Step-by-Step App Operator's Guide
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  Easy Tutorial
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simple visual instructions to help you navigate every feature without confusion.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'student'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal Guide</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('employee')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'employee'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Employee Portal Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tips'
                ? 'text-indigo-400 border-b-2 border-indigo-500 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Best Practices & FAQ</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200 text-xs sm:text-sm">
          
          {/* ─── TAB 1: STUDENT PORTAL GUIDE ─── */}
          {activeTab === 'student' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                <p className="text-xs text-indigo-200">
                  Follow these 5 simple steps to turn your classes, lectures, and voice memos into revision notes & exam quizzes.
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <h4 className="font-bold text-white text-sm">Record a Lecture or Upload Audio</h4>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  Click the <strong>"Record Audio"</strong> button on your dashboard. Allow microphone permissions in your browser and click <strong>Start Recording</strong>. You can also upload any existing audio file (MP3, WAV, M4A).
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <h4 className="font-bold text-white text-sm">Automatic AI Speech-to-Text</h4>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  Once you stop recording, our AI automatically transcribes your voice into clean, punctuation-accurate text with speaker tags.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <h4 className="font-bold text-white text-sm">Instant Study Notes & Summaries</h4>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  Click <strong>"Generate Study Notes"</strong>. The system automatically structures key takeaways, definitions, and formulas so you don't need to write manual notes.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                  <h4 className="font-bold text-white text-sm">Practice with AI Quizzes & Flashcards</h4>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  Visit the <strong>"Quizzes"</strong> tab. The app generates multiple-choice questions from your lecture. Test yourself to reinforce your learning and see your score!
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">5</span>
                  <h4 className="font-bold text-white text-sm">Ask Doubts & Report Any Issue</h4>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  Use <strong>"Doubt Chat"</strong> to ask any confusing concept. If you encounter any technical glitch or have suggestions, click <strong>"Helpdesk / Report Issue"</strong> to alert the Administrator.
                </p>
              </div>
            </div>
          )}

          {/* ─── TAB 2: EMPLOYEE PORTAL GUIDE ─── */}
          {activeTab === 'employee' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center gap-3">
                <Video className="w-5 h-5 text-indigo-400 shrink-0" />
                <p className="text-xs text-indigo-200">
                  Comprehensive guide for conducting live meetings, inviting coworkers, and generating automated action items.
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <h4 className="font-bold text-white text-sm">Click "Conduct Live Meeting" & Set Details</h4>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  Click the primary <strong>"Conduct Live Meeting"</strong> button. A setup dialog opens where you configure the <strong>Meeting Title</strong>, <strong>Scheduled Date</strong>, <strong>Due Time</strong>, and <strong>Agenda</strong>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <h4 className="font-bold text-white text-sm">Add Participants & Generate Invite Link</h4>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  Enter participant email addresses (e.g. <code>teammate@gmail.com</code>). The app generates a live shareable URL. You can copy the link immediately or click <strong>"Conduct & Send Invites"</strong> to deliver real email notifications to all members.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <h4 className="font-bold text-white text-sm">Meeting Shows on Coworkers' Respective Dashboards</h4>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  When your colleagues log in to their respective Employee accounts, the meeting automatically appears on their Meeting Intelligence dashboard under their scheduled sessions!
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                  <h4 className="font-bold text-white text-sm">Automatic Action Items & Task Tracker</h4>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  The AI worker extracts decisions and action tasks with deadlines. Track progress, mark items completed, or edit owners in real time.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">5</span>
                  <h4 className="font-bold text-white text-sm">Translate & Export Minutes</h4>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  Use the <strong>"Translate"</strong> tool to convert transcripts and summaries into Spanish, French, German, Tamil, Hindi, and 20+ languages.
                </p>
              </div>
            </div>
          )}

          {/* ─── TAB 3: TIPS & FAQ ─── */}
          {activeTab === 'tips' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  How to get the highest transcription accuracy?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use a clear microphone and speak within 1-2 feet. Avoid heavy background music. For noisy rooms, a basic headset significantly boosts speech recognition quality.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  Can participants join if they are not signed in?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Yes! The live meeting link generated by the system is public-accessible. When invited participants click the link, they can enter their name and participate in the live session directly.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  What should I do if something isn't working?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click the <strong>"Complaint Box / Helpdesk"</strong> button located on your top navigation. Choose the problem category, describe what occurred, and submit. The Administrator receives your report immediately to investigate and fix the problem.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">Need personal assistance? Use the Helpdesk button anytime.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Got it, Let's Start!
          </button>
        </div>

      </div>
    </div>
  );
}
