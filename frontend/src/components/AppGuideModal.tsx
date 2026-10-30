import { useState } from 'react';
import {
  BookOpen, X, Mic, Video, Users, Search, ChevronDown, ChevronUp,
  Brain, FlaskConical, BarChart2, Bell, Map, Lightbulb, FileText,
  ShieldAlert, HelpCircle, MessageSquare, User, Copy, Mail, CheckCircle2,
  Briefcase, GraduationCap, Globe, Upload, Sparkles, Play
} from 'lucide-react';

interface AppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: 'student' | 'employee';
}

interface FAQ {
  q: string;
  a: string;
}

interface FeatureStep {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
  title: string;
  what: string;
  howTo: string[];
  tip?: string;
}

const studentFeatures: FeatureStep[] = [
  {
    icon: Mic, color: 'indigo', title: 'Record Audio',
    what: 'Record live lectures or voice notes directly in the browser. Your voice is automatically converted to text.',
    howTo: [
      'Click "Record Audio" in the left sidebar.',
      'Allow microphone access when the browser asks.',
      'Click the red "Start Recording" button to begin.',
      'Speak clearly — the AI captures everything in real time.',
      'Click "Stop Recording" when done. The transcript auto-generates.',
      'Give it a title and save it to your notes.',
    ],
    tip: 'Use a quiet room and speak within 1–2 feet of the mic for best accuracy.',
  },
  {
    icon: Upload, color: 'blue', title: 'Upload Audio File',
    what: 'Already have a recorded lecture? Upload MP3, WAV, or M4A files and let the AI transcribe them.',
    howTo: [
      'Click "Record Audio" in the sidebar.',
      'Scroll down to find the "Upload Audio" section.',
      'Click the upload area or drag-and-drop your file.',
      'Wait for the AI to process and transcribe the file.',
      'Review, edit if needed, and save the note.',
    ],
  },
  {
    icon: BookOpen, color: 'violet', title: 'Subjects & Notes',
    what: 'All your subjects are organized here. Every audio recording is attached to a subject for easy retrieval.',
    howTo: [
      'Click "Subjects" in the sidebar.',
      'Choose a subject (e.g., Mathematics, Physics).',
      'View all notes and transcripts saved under that subject.',
      'Click any note to expand and read the full transcript or summary.',
      'Use the search bar at the top to find a specific note quickly.',
    ],
  },
  {
    icon: FileText, color: 'cyan', title: 'AI Study Notes & Summaries',
    what: 'The AI automatically extracts key definitions, formulas, bullet points, and summaries from your recordings.',
    howTo: [
      'Open any saved audio note.',
      'Click the "Generate Summary" or "Study Notes" button.',
      'Wait ~10 seconds for the AI to process.',
      'Read the structured notes: key points, definitions, and bullets appear.',
      'Click "Flashcards" inside the note to see swipe-ready revision cards.',
    ],
    tip: "Summaries are auto-generated after recording. If they don't appear, click \"Generate\" manually.",
  },
  {
    icon: Brain, color: 'purple', title: 'AI Guide (Doubt Chat)',
    what: 'Ask any study question or concept doubt. The AI gives instant, detailed answers like a personal tutor.',
    howTo: [
      'Click "AI Guide" in the sidebar.',
      'Type your doubt or concept question in the text box.',
      'Press Enter or click "Ask".',
      "Read the AI's explanation — it uses simple language with examples.",
      'Ask follow-up questions to dive deeper.',
    ],
    tip: 'You can also ask doubts from the Home dashboard using the quick "Ask AI" box.',
  },
  {
    icon: FlaskConical, color: 'amber', title: 'Quizzes & Practice Tests',
    what: 'The AI generates multiple-choice questions from your lecture recordings. Test yourself to reinforce learning.',
    howTo: [
      'Click "Quizzes" in the sidebar.',
      'Select a subject to generate a quiz from.',
      'Click "Start Quiz" — 10 questions appear.',
      'Choose your answer for each question and click "Next".',
      'At the end, see your score and review correct answers.',
      'Retry the quiz to improve your score!',
    ],
  },
  {
    icon: BarChart2, color: 'emerald', title: 'Progress Tracker',
    what: 'Track your study hours, quiz scores, and overall learning readiness across all subjects.',
    howTo: [
      'Click "Progress" in the sidebar.',
      'View your weekly study chart showing time spent per subject.',
      'Check your average quiz score trend.',
      'The "Readiness Score" at the top shows your overall exam readiness.',
    ],
    tip: 'Record more lectures to improve your readiness score!',
  },
  {
    icon: Bell, color: 'orange', title: 'Notifications & Reminders',
    what: 'Set study reminders so you never miss revision time. Notifications appear in the app.',
    howTo: [
      'Click "Notifications" in the sidebar.',
      'Click "Add Reminder".',
      'Enter the subject, topic, and reminder time.',
      "Save — you'll be notified inside the app when it's time.",
    ],
  },
  {
    icon: Lightbulb, color: 'yellow', title: 'Recommendations',
    what: 'The AI suggests study topics, YouTube lectures, articles, and resources personalized to your weak areas.',
    howTo: [
      'Click "Recommendations" in the sidebar.',
      'Select a subject from the filter dropdown.',
      'Browse the curated topic list.',
      'Click any resource link to open it in a new tab.',
    ],
  },
  {
    icon: Map, color: 'teal', title: 'Learning Path',
    what: 'A structured, week-by-week roadmap to master all subjects before your exam date.',
    howTo: [
      'Click "Learning Path" in the sidebar.',
      'View the timeline of topics ordered by priority.',
      "Check off topics you've completed.",
      'The path adjusts based on your pace.',
    ],
  },
  {
    icon: Globe, color: 'sky', title: 'Language Settings',
    what: 'Change the app language and your preferred speech language for AI transcription.',
    howTo: [
      'Click "Languages" in the sidebar, or go to Profile and click Edit.',
      'Select your preferred language from the dropdown.',
      'Save changes — the interface updates immediately.',
    ],
  },
  {
    icon: User, color: 'slate', title: 'My Profile',
    what: 'Update your display name, preferred language, and theme appearance.',
    howTo: [
      'Click "Profile" at the bottom of the sidebar.',
      'Click "Edit Profile" button.',
      'Update your full name, language, or theme.',
      'Click "Save Changes".',
    ],
  },
  {
    icon: ShieldAlert, color: 'rose', title: 'Report an Issue (Helpdesk)',
    what: 'If anything in the app is broken, confusing, or needs improvement — submit a complaint to the admin.',
    howTo: [
      'Click the "Report Issue" or "Helpdesk" button on the Dashboard.',
      'Select the problem category (e.g., Audio, Quiz, Account).',
      'Type a short description of the problem.',
      'Click "Submit Complaint".',
      'Track the status under "My Tickets" — the admin will respond.',
    ],
  },
];

const employeeFeatures: FeatureStep[] = [
  {
    icon: Briefcase, color: 'indigo', title: 'Conduct a Live Meeting',
    what: 'Start a real-time live meeting session with your team. Everything is recorded and transcribed automatically.',
    howTo: [
      'Click the blue "Conduct Live Meeting" button on the Meetings page.',
      'A setup dialog opens — fill in the Meeting Title.',
      'Set the Scheduled Date and Due Time (when the meeting is expected to end).',
      'Write a short Agenda describing what the meeting is about.',
      'Add participant email addresses (one per line or comma-separated).',
      'Click "Generate Link" — a unique live meeting URL is created instantly.',
      'Copy the link using the copy button and share it, OR click "Conduct & Send Invites" to send email invitations automatically.',
      'You are taken to the live meeting room.',
    ],
    tip: 'Participants who receive the email can click "Join Live Meeting Room" directly.',
  },
  {
    icon: Mail, color: 'blue', title: 'Send Meeting Invites by Email',
    what: 'Participants receive a branded email invitation with the meeting details and a direct join button.',
    howTo: [
      "In the meeting setup dialog, enter each participant's email address.",
      'Click "Conduct & Send Invites".',
      'Each participant receives an email with: Meeting title, Date & Time, Agenda, and a "Join Live Meeting Room" button.',
      'Participants registered in the app will also see the meeting on their own dashboard automatically.',
    ],
  },
  {
    icon: Copy, color: 'violet', title: 'Share the Meeting Link',
    what: 'The auto-generated meeting link can be shared via WhatsApp, email, or any chat app.',
    howTo: [
      'After clicking "Generate Link" in the setup dialog, a shareable URL appears.',
      'Click the "Copy Link" icon button next to the URL.',
      'Paste and share in your team chat (WhatsApp, Slack, etc.).',
      'Anyone with the link can join — no app account needed for guests.',
    ],
  },
  {
    icon: Video, color: 'cyan', title: 'Live Meeting Room',
    what: 'The live meeting room records audio in real time, shows the live transcript, and lets you collaborate.',
    howTo: [
      'After clicking "Conduct & Send Invites", you enter the Live Meeting Room.',
      'Click "Start Recording" to begin capturing audio.',
      'The live transcript appears on screen as people speak.',
      'When done, click "End Recording".',
      'Click "Finish & Save Meeting" — the system processes the recording.',
    ],
    tip: 'Make sure your microphone is selected correctly in your system settings before starting.',
  },
  {
    icon: Upload, color: 'teal', title: 'Upload a Previous Recording',
    what: 'Already recorded a meeting externally? Upload the audio file to get an AI transcript and summary.',
    howTo: [
      'On the Meetings page, click "Upload Previous Recording".',
      'Fill in the meeting title and date.',
      'Click the upload area or drag & drop your audio file (MP3, WAV, M4A).',
      'Click "Upload & Process" — the AI will transcribe it.',
      'View the transcript and summary once processing completes.',
    ],
  },
  {
    icon: Users, color: 'emerald', title: 'Viewing Meetings You Were Invited To',
    what: 'Meetings you are invited to automatically appear on your Meetings page — no manual import needed.',
    howTo: [
      'When a meeting organizer adds your email, the meeting appears in "All Meetings" automatically.',
      'Click on any meeting card to view its full details.',
      'See: Transcript, Summary, Action Items, and Participants list.',
    ],
  },
  {
    icon: Brain, color: 'purple', title: 'AI Meeting Summary & Action Items',
    what: 'After every meeting, the AI generates a structured summary with decisions made and action items with owners.',
    howTo: [
      'Open a completed meeting from the Meetings list.',
      'Scroll to the "Summary" section to see the AI-generated meeting recap.',
      'Scroll to "Action Items" to see tasks extracted from the discussion.',
      'Mark action items as "Completed" when done.',
      'Edit the owner or deadline of any action item inline.',
    ],
    tip: "Processing takes ~30–60 seconds after the meeting ends. Refresh the page if the summary isn't visible.",
  },
  {
    icon: Globe, color: 'sky', title: 'Translate Transcripts',
    what: 'Translate the meeting transcript into 20+ languages for global teams.',
    howTo: [
      'Open a completed meeting detail page.',
      'Click the "Translate" button on the transcript section.',
      'Select the target language from the dropdown.',
      'The translated version appears instantly below the original.',
    ],
  },
  {
    icon: Search, color: 'amber', title: 'Search Meeting Archive',
    what: 'Search through all past meeting transcripts by keyword, date, or speaker.',
    howTo: [
      'Click "Search Archive" in the sidebar.',
      'Type a keyword (e.g., "budget", "deadline", "Q4 plan").',
      'Results show which meeting contained that keyword.',
      'Click a result to jump directly to that meeting transcript.',
    ],
  },
  {
    icon: FileText, color: 'orange', title: 'My Tasks',
    what: 'View and manage all action items assigned to you across every meeting.',
    howTo: [
      'Look for "My Tasks" in the sidebar or within a meeting detail.',
      'View tasks with their due dates and owning meetings.',
      'Mark tasks complete by clicking the checkbox.',
      'Filter by: All, Pending, or Completed.',
    ],
  },
  {
    icon: User, color: 'slate', title: 'My Profile',
    what: 'Update your name, preferred language, and theme.',
    howTo: [
      'Click "Profile" in the sidebar.',
      'Click "Edit Profile".',
      'Update your full name or language preference.',
      'Click "Save Changes".',
    ],
  },
  {
    icon: ShieldAlert, color: 'rose', title: 'Report an Issue (Helpdesk)',
    what: 'Encountered a bug or something not working? Submit a complaint to the admin instantly.',
    howTo: [
      'Click the "Report Issue" or "Helpdesk" button on the Meetings page.',
      'Select the problem category.',
      'Type what happened.',
      'Click "Submit Complaint".',
      'Track resolution status under "My Tickets".',
    ],
  },
];

const studentFAQs: FAQ[] = [
  { q: 'The microphone is not working. What do I do?', a: 'Click the lock icon in the browser address bar, find "Microphone" and set it to "Allow". Then refresh the page and try recording again.' },
  { q: 'My transcript shows wrong words. How do I fix it?', a: 'You can manually edit the transcript by clicking on the text inside the note. Speak slowly and clearly in a quiet room to improve accuracy.' },
  { q: 'Quiz questions are not showing for my subject.', a: 'Make sure you have at least one audio recording saved under that subject. The AI generates questions from your own recordings.' },
  { q: 'I forgot my password. How do I reset it?', a: 'On the login page, click "Forgot Password". Enter your registered Gmail. A reset link will be emailed to you.' },
  { q: 'The AI summary is empty. What happened?', a: 'Click "Generate Summary" inside the note. If it still fails, the recording may have been too short. Try recording for at least 2 minutes.' },
  { q: 'Can I use the app on my phone?', a: "Yes! Open the app in your phone's browser (Chrome or Safari). It is fully mobile-responsive. Recording works on mobile too." },
];

const employeeFAQs: FAQ[] = [
  { q: 'No one received my meeting invite email. Why?', a: 'Check that the email addresses entered are correct. Also ensure the admin has configured the email service on the server.' },
  { q: 'The meeting transcript is blank after it ended.', a: 'Processing takes 30–60 seconds. Refresh the meeting detail page. If it is still blank after 5 minutes, contact the admin via the Helpdesk.' },
  { q: "Participants can't join my meeting link.", a: 'The meeting link is publicly accessible — no account required. Ensure you copied the full URL. Try opening it in an incognito browser window to verify it works.' },
  { q: "The meeting does not appear on my coworker's dashboard.", a: 'Check that you used their correct registered email address. The meeting auto-syncs when they log in. Ask them to refresh their meetings page.' },
  { q: 'Audio recording stops on its own.', a: 'Some browsers disconnect the mic after inactivity. Keep the tab active during the meeting and avoid switching tabs while recording.' },
  { q: 'Can I record without an internet connection?', a: 'No, an internet connection is required for live transcription and AI processing. For offline recordings, use an external recorder and upload the file afterward.' },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  text: 'text-indigo-400',  badge: 'bg-indigo-600' },
  blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    badge: 'bg-blue-600' },
  violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-400',  badge: 'bg-violet-600' },
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400',    badge: 'bg-cyan-600' },
  purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400',  badge: 'bg-purple-600' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   badge: 'bg-amber-600' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-600' },
  orange:  { bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  text: 'text-orange-400',  badge: 'bg-orange-600' },
  yellow:  { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  text: 'text-yellow-400',  badge: 'bg-yellow-600' },
  teal:    { bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    text: 'text-teal-400',    badge: 'bg-teal-600' },
  sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     text: 'text-sky-400',     badge: 'bg-sky-600' },
  slate:   { bg: 'bg-slate-700/30',   border: 'border-slate-600/40',   text: 'text-slate-300',   badge: 'bg-slate-600' },
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-400',    badge: 'bg-rose-600' },
};

function FeatureCard({ step }: { step: FeatureStep }) {
  const [expanded, setExpanded] = useState(false);
  const c = colorMap[step.color] || colorMap.indigo;
  const Icon = step.icon;

  return (
    <div className={`rounded-2xl border ${c.border} bg-slate-900/70 overflow-hidden`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{step.title}</p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{step.what}</p>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800/60 pt-3">
          <p className="text-xs text-slate-300 leading-relaxed">{step.what}</p>
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">How to use:</p>
            <ol className="space-y-1.5">
              {step.howTo.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className={`w-5 h-5 rounded-full ${c.badge} text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5`}>{i + 1}</span>
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ol>
          </div>
          {step.tip && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200 leading-relaxed"><strong>Tip:</strong> {step.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
        <p className="flex-1 text-xs font-semibold text-white">{faq.q}</p>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-800/60 pt-3">
          <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  );
}

export default function AppGuideModal({ isOpen, onClose, role = 'student' }: AppGuideModalProps) {
  const [activeSection, setActiveSection] = useState<'features' | 'faq'>('features');

  if (!isOpen) return null;

  const isEmployee = role === 'employee';
  const features = isEmployee ? employeeFeatures : studentFeatures;
  const faqs = isEmployee ? employeeFAQs : studentFAQs;
  const gradFrom = isEmployee ? 'from-violet-900/40' : 'from-indigo-950/40';
  const badgeCls = isEmployee
    ? 'bg-violet-600/20 text-violet-300 border-violet-500/30'
    : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30';
  const RoleIcon = isEmployee ? Briefcase : GraduationCap;
  const roleLabel = isEmployee ? 'Employee Portal' : 'Student Portal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={`p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r ${gradFrom} via-transparent to-transparent`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                App Guide
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${badgeCls} flex items-center gap-1`}>
                  <RoleIcon className="w-3 h-3" /> {roleLabel}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Step-by-step instructions for every feature</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 pt-3 gap-1">
          <button
            onClick={() => setActiveSection('features')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 ${activeSection === 'features' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Play className="w-3.5 h-3.5" /> Feature Guide ({features.length})
          </button>
          <button
            onClick={() => setActiveSection('faq')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 ${activeSection === 'faq' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Doubts & FAQ ({faqs.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {activeSection === 'features' && (
            <>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-slate-300">Click any feature below to expand the full step-by-step instructions.</p>
              </div>
              {features.map((f) => <FeatureCard key={f.title} step={f} />)}
            </>
          )}

          {activeSection === 'faq' && (
            <>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <p className="text-xs text-slate-300">Common doubts answered. Click each to expand.</p>
              </div>
              {faqs.map((faq) => <FAQItem key={faq.q} faq={faq} />)}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 mt-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-300">Still need help?</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Use the <strong className="text-white">Helpdesk / Report Issue</strong> button on your dashboard to send a complaint directly to the Admin. The admin will investigate and respond.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">{features.length} features · {faqs.length} FAQs</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
