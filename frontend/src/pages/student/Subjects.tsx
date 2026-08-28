import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Loader2, 
  Trash2, 
  X, 
  Check, 
  FileText, 
  Sparkles, 
  FlaskConical, 
  Edit3,
  ArrowRight,
  ChevronLeft,
  Layers,
  Award
} from 'lucide-react';
import api from '../../lib/api';
import { getSubjectEmoji } from '../../lib/subjectEmojis';

interface Subject { 
  id: string; 
  _id?: string;
  name: string; 
  description: string; 
  color?: string; 
  note_count?: number;
  readiness_score?: number;
}

interface Note {
  id: string;
  _id?: string;
  title: string;
  subject_id?: string;
  subjectId?: string;
  subject_name?: string;
  status: string;
  duration_seconds?: number;
  transcript?: string;
  summary?: string;
  bullet_points?: string[];
  key_points?: string[];
  created_at?: string;
}

const COLORS = ['blue', 'purple', 'emerald', 'amber', 'rose', 'cyan'];
const GRADIENTS: Record<string, string> = {
  blue: 'from-blue-500 to-indigo-600',
  purple: 'from-purple-500 to-pink-600',
  emerald: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-600',
  rose: 'from-rose-500 to-pink-600',
  cyan: 'from-cyan-500 to-blue-600',
};

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation Levels: 'subjects' (Level 1) | 'topics' (Level 2) | 'detail' (Level 3)
  const [viewLevel, setViewLevel] = useState<'subjects' | 'topics' | 'detail'>('subjects');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [subjectTopics, setSubjectTopics] = useState<Note[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [activeTopic, setActiveTopic] = useState<Note | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'takeaways' | 'summary' | 'flashcards'>('notes');

  // Flashcards state for active topic
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [fcIndex, setFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Subject Creation Modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [savingSubject, setSavingSubject] = useState(false);

  // Text Note / Custom Topic Creation Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteSubjectId, setNoteSubjectId] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/subjects');
      const subs = data.data?.subjects || data.data || [];
      setSubjects(subs);
      if (subs.length > 0 && !noteSubjectId) {
        setNoteSubjectId(subs[0].id || subs[0]._id);
      }
    } catch { 
      setSubjects([]); 
    }
    setLoading(false);
  };

  useEffect(() => { 
    loadSubjects(); 
  }, []);

  const openSubjectTopics = async (subject: Subject) => {
    setActiveSubject(subject);
    setViewLevel('topics');
    setLoadingTopics(true);
    const subId = subject.id || subject._id;
    try {
      const { data } = await api.get(`/subjects/${subId}/notes`);
      const notesList = data.data?.notes || data.data || [];
      setSubjectTopics(notesList);
    } catch {
      setSubjectTopics([]);
    }
    setLoadingTopics(false);
  };

  const openTopicDetail = async (topic: Note) => {
    setActiveTopic(topic);
    setViewLevel('detail');
    setActiveTab('notes');
    setFcIndex(0);
    setIsFlipped(false);
    
    // Fetch full note content & flashcards
    const noteId = topic.id || topic._id;
    try {
      const [nRes, fcRes] = await Promise.all([
        api.get(`/notes/${noteId}`).catch(() => null),
        api.get(`/flashcards/${noteId}`).catch(() => null)
      ]);
      if (nRes?.data?.data) {
        setActiveTopic(nRes.data.data);
      }
      const cards = fcRes?.data?.data?.cards || fcRes?.data?.data || [];
      if (cards.length > 0) {
        setFlashcards(cards);
      } else {
        // Synthesize cards from topic bullet points
        const bullets = topic.bullet_points || topic.key_points || [];
        setFlashcards([
          { front_question: `What is the core definition of ${topic.title}?`, back_answer: topic.summary || 'Fundamental concept in this subject.', hint: 'Think about the primary purpose.' },
          { front_question: `What are key properties or rules for ${topic.title}?`, back_answer: bullets[0] || 'See study notes.', hint: 'Review the lecture takeaways.' },
          { front_question: `Where is ${topic.title} applied in real-world systems?`, back_answer: bullets[1] || 'Industrial software engineering and system architecture.', hint: 'Production workloads.' }
        ]);
      }
    } catch {
      // Keep existing topic
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSubject(true);
    try {
      await api.post('/subjects', { name, description, color });
      setName(''); 
      setDescription(''); 
      setColor('blue'); 
      setShowSubjectModal(false);
      await loadSubjects();
    } catch (err: any) { 
      alert(err.response?.data?.error || 'Failed to create subject'); 
    }
    setSavingSubject(false);
  };

  const handleDeleteSubject = async (id: string, subName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${subName}" and all its topics?`)) return;
    
    setSubjects(prev => prev.filter(s => (s.id || s._id) !== id));
    if (activeSubject && (activeSubject.id || activeSubject._id) === id) {
      setViewLevel('subjects');
      setActiveSubject(null);
    }
    try {
      await api.delete(`/subjects/${id}`);
      await loadSubjects();
    } catch {
      alert('Failed to delete subject');
      await loadSubjects();
    }
  };

  const handleDeleteTopic = async (noteId: string, topicTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete topic note "${topicTitle}"?`)) return;
    setSubjectTopics(prev => prev.filter(n => (n.id || n._id) !== noteId));
    if (activeTopic && (activeTopic.id || activeTopic._id) === noteId) {
      setViewLevel('topics');
      setActiveTopic(null);
    }
    try {
      await api.delete(`/notes/${noteId}`);
      if (activeSubject) openSubjectTopics(activeSubject);
    } catch {
      alert('Failed to delete topic note');
    }
  };

  const handleCreateTextNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNote(true);
    try {
      const targetSubId = activeSubject ? (activeSubject.id || activeSubject._id) : noteSubjectId;
      await api.post('/notes/text', {
        subjectId: targetSubId,
        topic: noteTitle,
        title: noteTitle,
        content: noteContent,
      });

      setShowNoteModal(false);
      setNoteTitle('');
      setNoteContent('');
      
      // Reload topics and subjects
      await loadSubjects();
      if (activeSubject) {
        await openSubjectTopics(activeSubject);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save note.');
    }
    setSavingNote(false);
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center p-6 min-h-[400px]">
      <Loader2 size={36} className="text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 text-white max-w-6xl mx-auto space-y-6">
      
      {/* ========================================================================= */}
      {/* LEVEL 1: SUBJECT CATALOG VIEW                                             */}
      {/* ========================================================================= */}
      {viewLevel === 'subjects' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-blue-400" />
                Subjects & Topic Curricula
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Select a subject to explore its individual topic notes, study guides, flashcards, and 8-level quizzes.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (subjects.length > 0) setNoteSubjectId(subjects[0].id || subjects[0]._id || '');
                  setShowNoteModal(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-700 shadow transition-all"
              >
                <Edit3 size={15} className="text-emerald-400" />
                <span>+ Add Topic Note</span>
              </button>

              <button
                onClick={() => setShowSubjectModal(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
              >
                <Plus size={15} />
                <span>+ Create Subject</span>
              </button>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {subjects.map((sub) => {
              const subId = sub.id || sub._id || '';
              const grad = GRADIENTS[sub.color || 'blue'] || GRADIENTS.blue;
              const emoji = getSubjectEmoji(sub.name);

              return (
                <div
                  key={subId}
                  onClick={() => openSubjectTopics(sub)}
                  className="cursor-pointer group rounded-3xl border border-slate-800 bg-slate-900 p-6 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-2xl shadow-lg`}>
                        <span>{emoji}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSubject(subId, sub.name, e)}
                        title="Delete Subject"
                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-60 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors mb-1.5">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {sub.description || 'Comprehensive curriculum with in-depth topic notes and assessments.'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <Layers size={14} />
                        {sub.note_count || 5} Topics Available
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Award size={14} />
                        {sub.readiness_score || 85}% Mastery
                      </span>
                    </div>

                    <div className="w-full py-2 px-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <span>Open Subject & View Topics</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: SUBJECT TOPICS LIST VIEW                                         */}
      {/* ========================================================================= */}
      {viewLevel === 'topics' && activeSubject && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <button 
                onClick={() => setViewLevel('subjects')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 font-semibold transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Back to All Subjects</span>
              </button>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <span className="text-2xl">{getSubjectEmoji(activeSubject.name)}</span>
                {activeSubject.name}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {activeSubject.description || 'Select any topic below to view detailed notes, key formulas, flashcards, and quizzes.'}
              </p>
            </div>

            <button
              onClick={() => {
                setNoteSubjectId(activeSubject.id || activeSubject._id || '');
                setShowNoteModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition-all"
            >
              <Plus size={15} />
              <span>+ Add Note to this Subject</span>
            </button>
          </div>

          {loadingTopics ? (
            <div className="py-20 flex justify-center">
              <Loader2 size={32} className="text-blue-400 animate-spin" />
            </div>
          ) : subjectTopics.length === 0 ? (
            <div className="py-16 text-center text-slate-500 rounded-3xl border border-dashed border-slate-800 space-y-3">
              <FileText size={36} className="mx-auto text-slate-600" />
              <p className="font-semibold text-white">No topics yet in this subject.</p>
              <button
                onClick={() => {
                  setNoteSubjectId(activeSubject.id || activeSubject._id || '');
                  setShowNoteModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
              >
                Create First Topic Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectTopics.map((topic, index) => {
                const topicId = topic.id || topic._id || '';

                return (
                  <div
                    key={topicId}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-500/40 hover:bg-slate-800/90 transition-all shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                          Topic {index + 1}
                        </span>
                        <button
                          onClick={(e) => handleDeleteTopic(topicId, topic.title, e)}
                          title="Delete Topic Note"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-white mb-2 line-clamp-1">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {topic.summary || topic.transcript?.slice(0, 150) || 'Comprehensive study note and reference guide.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => openTopicDetail(topic)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all"
                      >
                        <FileText size={13} />
                        <span>Study In-Depth Notes</span>
                      </button>
                      
                      <a
                        href="/student/quiz"
                        className="py-2 px-3 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-purple-300 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <FlaskConical size={13} />
                        <span>Take Quiz</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: IN-DEPTH TOPIC STUDY CENTER                                      */}
      {/* ========================================================================= */}
      {viewLevel === 'detail' && activeTopic && activeSubject && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <button 
                onClick={() => setViewLevel('topics')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 font-semibold transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Back to {activeSubject.name} Topics</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  {activeSubject.name}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1">
                {activeTopic.title}
              </h1>
            </div>

            <a
              href="/student/quiz"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all"
            >
              <FlaskConical size={16} />
              <span>Take 8-Level Topic Quiz (16 MCQs)</span>
            </a>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { key: 'notes', label: '📖 Comprehensive Notes' },
              { key: 'takeaways', label: '⚡ Key Takeaways & Formulas' },
              { key: 'summary', label: '💡 Executive Summary' },
              { key: 'flashcards', label: `🗂️ Flashcards (${flashcards.length})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-blue-500'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Comprehensive Lecture Notes */}
          {activeTab === 'notes' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Full In-Depth Topic Guide
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Verified Academic Content
                </span>
              </div>

              <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans space-y-4">
                {activeTopic.transcript || activeTopic.summary || 'Detailed lecture text is ready.'}
              </div>
            </div>
          )}

          {/* Tab 2: Key Takeaways & Formulas */}
          {activeTab === 'takeaways' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                High-Yield Principles & Key Takeaways
              </h3>
              {(activeTopic.key_points && activeTopic.key_points.length > 0) || (activeTopic.bullet_points && activeTopic.bullet_points.length > 0) ? (
                <div className="grid grid-cols-1 gap-3">
                  {(activeTopic.key_points || activeTopic.bullet_points || []).map((kp, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-200 shadow-md">
                      <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                      <span className="leading-relaxed font-medium">{kp}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-sm leading-relaxed">
                  {activeTopic.summary || activeTopic.transcript?.slice(0, 300)}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Executive Summary */}
          {activeTab === 'summary' && (
            <div className="rounded-3xl bg-purple-950/20 border border-purple-500/30 p-8 text-purple-200 shadow-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Sparkles size={16} />
                2-Minute High-Yield Summary
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line font-medium">
                {activeTopic.summary || 'Summary is active for this topic note.'}
              </p>
            </div>
          )}

          {/* Tab 4: Interactive Topic Flashcards */}
          {activeTab === 'flashcards' && (
            <div className="max-w-xl mx-auto py-6 space-y-6">
              {flashcards.length === 0 ? (
                <div className="p-8 text-center text-slate-500 rounded-3xl border border-slate-800">
                  No flashcards available for this topic.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                    <span>Card {fcIndex + 1} of {flashcards.length}</span>
                    <span className="text-blue-400">Click card to flip</span>
                  </div>

                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className={`cursor-pointer min-h-[220px] rounded-3xl border p-8 flex flex-col justify-between text-center transition-all duration-300 shadow-2xl ${
                      isFlipped
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                        : 'border-blue-500/40 bg-slate-900 text-white hover:border-blue-500'
                    }`}
                  >
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isFlipped ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {isFlipped ? 'Answer' : 'Question'}
                    </span>

                    <h3 className="text-base font-bold leading-relaxed px-4">
                      {isFlipped 
                        ? flashcards[fcIndex].back_answer || flashcards[fcIndex].back 
                        : flashcards[fcIndex].front_question || flashcards[fcIndex].front}
                    </h3>

                    {flashcards[fcIndex].hint && !isFlipped && (
                      <p className="text-xs text-amber-300/80 italic">
                        💡 Hint: {flashcards[fcIndex].hint}
                      </p>
                    )}
                    <div />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => { setFcIndex(Math.max(0, fcIndex - 1)); setIsFlipped(false); }}
                      disabled={fcIndex === 0}
                      className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      ← Previous Card
                    </button>

                    <button
                      onClick={() => { setFcIndex(Math.min(flashcards.length - 1, fcIndex + 1)); setIsFlipped(false); }}
                      disabled={fcIndex === flashcards.length - 1}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-30 shadow"
                    >
                      Next Card →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE SUBJECT                                                     */}
      {/* ========================================================================= */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={() => setShowSubjectModal(false)}>
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Create New Subject</h2>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">Subject Name *</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Distributed Systems"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white text-xs placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief overview of the subject..."
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-white text-xs placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">Color Theme</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-xl bg-gradient-to-br ${GRADIENTS[c]} flex items-center justify-center transition-transform ${color === c ? 'scale-110 ring-2 ring-white' : 'opacity-60'}`}
                    >
                      {color === c && <Check size={14} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSubject}
                className="w-full mt-2 rounded-xl bg-blue-600 py-3 font-bold text-white text-xs hover:bg-blue-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {savingSubject ? <Loader2 size={16} className="animate-spin" /> : 'Create Subject & Seed Topic Quizzes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE TEXT NOTE / TOPIC                                           */}
      {/* ========================================================================= */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={() => setShowNoteModal(false)}>
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create Topic Note</h2>
                  <p className="text-xs text-slate-400">Save notes for any topic in this subject.</p>
                </div>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTextNote} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">1. Select Subject *</label>
                <select
                  required
                  value={noteSubjectId}
                  onChange={e => setNoteSubjectId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white text-xs focus:border-blue-500 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">2. Topic / Note Title *</label>
                <input
                  required
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="e.g. CPU Scheduling Algorithms (Round Robin & SJF)"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-white text-xs placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">3. Full Note Content / Lecture Text *</label>
                <textarea
                  required
                  rows={6}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Paste or write your detailed study notes, code snippets, key rules, and definitions here..."
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white text-xs placeholder-slate-500 focus:border-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={savingNote}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-bold text-white text-xs hover:opacity-90 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
              >
                {savingNote ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving Note & Generating 16-Question Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Save Topic Note & Generate AI Assessments
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
