import { useEffect, useState } from 'react';
import { 
  FlaskConical, 
  Loader2, 
  RotateCcw, 
  Trophy, 
  Search, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Lightbulb, 
  Lock, 
  Unlock, 
  Sparkles, 
  ArrowRight,
  Trash2
} from 'lucide-react';
import api from '../../lib/api';

interface Subject { id: string; _id?: string; name: string; }
interface Quiz { 
  id: string; 
  title: string; 
  subject_id: string; 
  subject_name?: string; 
  difficulty?: string; 
  question_count?: number; 
  due_date?: string;
  deadline?: string;
  best_score?: number;
}

const LEVEL_NAMES = [
  'Level 1: Core Fundamentals',
  'Level 2: Concept Identification',
  'Level 3: Mechanism Tracing',
  'Level 4: Complexity Analysis',
  'Level 5: Problem Solving',
  'Level 6: Scenario Trade-offs',
  'Level 7: Advanced Applications',
  'Level 8: System Mastery',
];

interface FormattedQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer?: string;
  correct_index: number;
  explanation: string;
  hint?: string;
  level: number;
  difficulty?: string;
}

interface EvaluatedItem {
  questionText: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  level?: number;
}

export default function Quiz() {
  const [phase, setPhase] = useState<'select' | 'levels' | 'quiz' | 'result'>('select');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  
  // Question bank and filtered level questions
  const [allQuestions, setAllQuestions] = useState<FormattedQuestion[]>([]);
  const [activeLevel, setActiveLevel] = useState<number | 'all'>('all');
  const [currentQuestions, setCurrentQuestions] = useState<FormattedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<EvaluatedItem[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  
  // Filter states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Unlocked levels state per quiz stored in localStorage
  const [unlockedLevelMap, setUnlockedLevelMap] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([api.get('/subjects'), api.get('/quizzes')]).then(([sRes, qRes]) => {
      const subs = sRes.data.data?.subjects || sRes.data.data || [];
      const qs = qRes.data.data?.quizzes || qRes.data.data || [];
      setSubjects(subs);
      setQuizzes(qs);
    }).catch(() => {}).finally(() => setLoading(false));

    // Load unlocked level map
    try {
      const saved = localStorage.getItem('smart_notes_unlocked_levels');
      if (saved) setUnlockedLevelMap(JSON.parse(saved));
    } catch {}
  }, []);

  const saveUnlockedLevel = (quizId: string, level: number) => {
    setUnlockedLevelMap(prev => {
      const currentMax = prev[quizId] || 1;
      const newMax = Math.max(currentMax, level);
      const updated = { ...prev, [quizId]: newMax };
      try { localStorage.setItem('smart_notes_unlocked_levels', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const isSubjectMatch = (q: Quiz, targetId: string) => {
    if (targetId === 'all') return true;
    const targetSub = subjects.find(s => (s.id || s._id) === targetId);
    const qSubId = typeof q.subject_id === 'string' ? q.subject_id : (q as any).subject_id?._id || (q as any).subjectId;
    
    if (qSubId && (qSubId === targetId || qSubId.toString() === targetId.toString())) return true;
    
    if (targetSub) {
      const sName = targetSub.name.toLowerCase();
      const qTitle = (q.title || '').toLowerCase();
      const qSubName = (q.subject_name || '').toLowerCase();
      const qTopic = ((q as any).topic_tag || '').toLowerCase();

      if (qSubName && (qSubName.includes(sName) || sName.includes(qSubName))) return true;
      if (qTopic && (qTopic.includes(sName) || sName.includes(qTopic))) return true;
      
      if (sName.includes('data structure') && (
        qTitle.includes('array') || qTitle.includes('tree') || qTitle.includes('graph') || 
        qTitle.includes('stack') || qTitle.includes('queue') || qTitle.includes('list') || 
        qTitle.includes('dijkstra') || qTitle.includes('data structure')
      )) return true;

      if (sName.includes('operating system') && (
        qTitle.includes('process') || qTitle.includes('cpu') || qTitle.includes('scheduling') || 
        qTitle.includes('memory') || qTitle.includes('paging') || qTitle.includes('file system') || 
        qTitle.includes('operating system') || qTitle.includes('virtual memory')
      )) return true;

      if (sName.includes('data analytic') && (
        qTitle.includes('statistic') || qTitle.includes('regression') || qTitle.includes('eda') || 
        qTitle.includes('clustering') || qTitle.includes('data analytic') || qTitle.includes('logistic') || 
        qTitle.includes('mean') || qTitle.includes('pca')
      )) return true;
    }
    return false;
  };

  const openTopicLevels = async (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setLoading(true);
    try {
      const { data } = await api.get(`/quizzes/${quiz.id}`);
      const rawQs = data.data?.questions || [];
      const formatted: FormattedQuestion[] = rawQs.map((q: any, i: number) => ({
        id: q.questionId || q.question_id || q._id || String(i + 1),
        question_text: q.question || q.question_text || `Question ${i + 1}`,
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: q.correct_answer || (q.options ? q.options[q.correct_index ?? q.correctIndex ?? 0] : undefined),
        correct_index: q.correct_index ?? q.correctIndex ?? 0,
        explanation: q.explanation || 'See topic notes for complete conceptual breakdown.',
        hint: q.hint || 'Think about the primary operational definition and asymptotic bounds.',
        level: q.level || Math.floor(i / 2) + 1,
        difficulty: q.difficulty || (i < 4 ? 'easy' : i < 12 ? 'medium' : 'hard'),
      }));
      setAllQuestions(formatted);
      setPhase('levels');
    } catch {
      setAllQuestions([]);
    }
    setLoading(false);
  };

  const startLevelQuiz = (levelNum: number | 'all') => {
    setActiveLevel(levelNum);
    let filtered: FormattedQuestion[] = [];
    if (levelNum === 'all') {
      filtered = allQuestions;
    } else {
      // Exactly 2 questions for this level
      filtered = allQuestions.filter(q => q.level === levelNum).slice(0, 2);
      // If none explicitly tagged, slice by index (2 questions per level)
      if (filtered.length === 0) {
        const startIdx = (Number(levelNum) - 1) * 2;
        filtered = allQuestions.slice(startIdx, startIdx + 2);
      }
    }
    setCurrentQuestions(filtered);
    setAnswers({});
    setEvaluations([]);
    setQIndex(0);
    setShowHint(false);
    setPhase('quiz');
  };

  const selectAnswer = (qId: string, ans: string) => {
    setAnswers(prev => ({ ...prev, [qId]: ans }));
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    let correctCount = 0;
    const evals: EvaluatedItem[] = currentQuestions.map((q) => {
      const userAns = answers[q.id] || 'Not answered';
      const isCorrect = userAns === q.correct_answer || 
        (q.options && q.options.indexOf(userAns) === q.correct_index);
      if (isCorrect) correctCount++;
      return {
        questionText: q.question_text,
        options: q.options || [],
        userAnswer: userAns,
        correctAnswer: q.correct_answer || (q.options ? q.options[q.correct_index || 0] : 'N/A'),
        isCorrect,
        explanation: q.explanation || 'See subject notes for core takeaways.',
        level: q.level,
      };
    });

    const calculatedScore = Math.round((correctCount / Math.max(1, currentQuestions.length)) * 100);
    setScore(calculatedScore);
    setEvaluations(evals);

    // If passed level (>= 50%), unlock next level!
    if (activeQuiz && typeof activeLevel === 'number' && calculatedScore >= 50) {
      saveUnlockedLevel(activeQuiz.id, activeLevel + 1);
    }

    try {
      if (activeQuiz) {
        await api.post(`/quizzes/${activeQuiz.id}/attempt`, {
          answers_json: evals,
          score: calculatedScore,
        });
      }
    } catch {}

    setPhase('result');
    setSubmitting(false);
  };

  const handleDeleteQuiz = async (quizId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete assessment test "${title}"?`)) return;
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
    if (activeQuiz && activeQuiz.id === quizId) {
      setPhase('select');
      setActiveQuiz(null);
    }
    try {
      await api.delete(`/quizzes/${quizId}`);
    } catch {
      alert('Failed to delete test');
    }
  };

  const reset = () => { 
    setPhase('select'); 
    setActiveQuiz(null); 
    setAllQuestions([]);
    setCurrentQuestions([]); 
    setAnswers({}); 
    setEvaluations([]); 
    setScore(0); 
    setShowHint(false);
  };

  const currentQ = currentQuestions[qIndex];

  const filteredQuizzes = quizzes.filter(q => {
    const matchSub = isSubjectMatch(q, selectedSubjectId);
    const matchSearch = searchTerm === '' || q.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSub && matchSearch;
  });

  const fmtDeadline = (d?: string) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center p-6 min-h-[400px]">
      <Loader2 size={36} className="text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 text-white max-w-6xl mx-auto space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. SELECT TOPIC & SUBJECT PHASE                                           */}
      {/* ========================================================================= */}
      {phase === 'select' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <FlaskConical className="w-7 h-7 text-blue-400" />
                8-Level Progressive Quizzes & Assessments
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Each topic contains 16 verified questions divided into 8 progressive levels (exactly 2 questions per level).
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topic or concept..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Subject Filter Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              1. Choose Subject:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubjectId('all')}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                  selectedSubjectId === 'all'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                All Subjects ({quizzes.length} Topics)
              </button>
              {subjects.map(s => {
                const subId = s.id || s._id || '';
                const count = quizzes.filter(q => isSubjectMatch(q, subId)).length;
                return (
                  <button
                    key={subId}
                    onClick={() => setSelectedSubjectId(subId)}
                    className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedSubjectId === subId
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 opacity-70" />
                    {s.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Cards List */}
          {filteredQuizzes.length === 0 ? (
            <div className="py-20 text-center text-slate-500 rounded-3xl border border-dashed border-slate-800">
              <FlaskConical size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-white">No topics found for this filter.</p>
              <p className="text-xs text-slate-400 mt-1">Try switching subject or clearing your search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {filteredQuizzes.map(quiz => {
                const subject = subjects.find(s => isSubjectMatch(quiz, s.id || s._id || ''));
                const unlockedMax = unlockedLevelMap[quiz.id] || 1;
                const deadlineText = fmtDeadline(quiz.due_date || quiz.deadline);

                return (
                  <div
                    key={quiz.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 truncate max-w-[170px]">
                          {quiz.subject_name || subject?.name || 'Core Topic'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 px-2.5 py-0.5 text-[11px] font-bold">
                            8 Levels • 16 MCQs
                          </span>
                          <button
                            onClick={(e) => handleDeleteQuiz(quiz.id, quiz.title, e)}
                            title="Delete Assessment Test"
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-base mb-2 line-clamp-2">
                        {quiz.title}
                      </h3>

                      {deadlineText ? (
                        <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          <Clock size={13} className="text-amber-400" />
                          <span>Deadline: {deadlineText}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-emerald-400 mb-3 font-medium">
                          <CheckCircle2 size={14} />
                          <span>Unlocked up to Level {unlockedMax} of 8</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => openTopicLevels(quiz)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all group"
                    >
                      <span>Explore 8 Levels</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. TOPIC 8-LEVEL MAP SELECTION PHASE                                     */}
      {/* ========================================================================= */}
      {phase === 'levels' && activeQuiz && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <button 
                onClick={() => setPhase('select')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 font-semibold"
              >
                ← Back to Topic List
              </button>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                {activeQuiz.title}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Progress through all 8 levels (2 questions per level). Score 50%+ to unlock the next level!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => handleDeleteQuiz(activeQuiz.id, activeQuiz.title, e)}
                className="py-2.5 px-4 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:text-white text-red-400 font-bold text-xs shadow transition-all flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Delete Assessment</span>
              </button>
              <button
                onClick={() => startLevelQuiz('all')}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Take Full 16-Question Master Assessment
              </button>
            </div>
          </div>

          {/* 8-Level Interactive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LEVEL_NAMES.map((name, idx) => {
              const levelNum = idx + 1;
              const maxUnlocked = unlockedLevelMap[activeQuiz.id] || 1;
              const isUnlocked = levelNum <= maxUnlocked;
              const difficultyTag = levelNum <= 2 ? 'Easy' : levelNum <= 6 ? 'Medium' : 'Hard';

              return (
                <div
                  key={levelNum}
                  className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? 'border-slate-800 bg-slate-900 hover:border-blue-500/50 hover:bg-slate-800/90 shadow-md'
                      : 'border-slate-800/50 bg-slate-950/60 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        difficultyTag === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        difficultyTag === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {difficultyTag}
                      </span>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                          <Unlock size={13} /> Unlocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                          <Lock size={13} /> Locked
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-sm mt-1">{name}</h4>
                    <p className="text-xs text-slate-400 mt-1">2 Concept Questions</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60">
                    {isUnlocked ? (
                      <button
                        onClick={() => startLevelQuiz(levelNum)}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all"
                      >
                        <span>Start Level {levelNum}</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-semibold text-center">
                        Pass Level {levelNum - 1} to Unlock
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACTIVE QUIZ QUESTIONS PHASE                                           */}
      {/* ========================================================================= */}
      {phase === 'quiz' && currentQ && (
        <div className="max-w-2xl mx-auto py-4 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-0.5">
                {activeQuiz?.title} • {activeLevel === 'all' ? 'Master Deck' : `Level ${activeLevel}`}
              </span>
              <p className="text-sm text-slate-400">
                Question {qIndex + 1} of {currentQuestions.length} (Level {currentQ.level})
              </p>
            </div>
            <button 
              onClick={() => setPhase('levels')} 
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-semibold"
            >
              <RotateCcw size={12} /> Exit Level
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300" 
              style={{ width: `${((qIndex + 1) / currentQuestions.length) * 100}%` }} 
            />
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-white leading-relaxed">
                {currentQ.question_text}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                Level {currentQ.level}
              </span>
            </div>
            
            {/* 4 Standard Options */}
            <div className="space-y-3">
              {(currentQ.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => selectAnswer(currentQ.id, opt)}
                  className={`w-full text-left rounded-2xl border px-5 py-4 text-sm font-medium transition-all ${
                    answers[currentQ.id] === opt
                      ? 'border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/10 font-semibold'
                      : 'border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-bold text-slate-500 mr-2.5">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ))}
            </div>

            {/* Non-Spoiling Learning Hint Toggle */}
            {currentQ.hint && (
              <div className="pt-2">
                {!showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors"
                  >
                    <Lightbulb size={13} />
                    <span>Need a Hint?</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed flex items-start gap-2">
                    <Lightbulb size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 block mb-0.5 font-bold">Learning Hint:</strong>
                      {currentQ.hint}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Footer */}
            <div className="mt-8 flex justify-between pt-4 border-t border-slate-800">
              <button 
                onClick={() => { setQIndex(Math.max(0, qIndex - 1)); setShowHint(false); }} 
                disabled={qIndex === 0}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-400 hover:border-slate-500 disabled:opacity-30 transition-colors font-semibold"
              >
                ← Previous
              </button>
              {qIndex < currentQuestions.length - 1 ? (
                <button 
                  onClick={() => { setQIndex(qIndex + 1); setShowHint(false); }}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all"
                >
                  Next Question →
                </button>
              ) : (
                <button 
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Assessment'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RESULTS & LEVEL PROGRESSION PHASE                                      */}
      {/* ========================================================================= */}
      {phase === 'result' && (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl space-y-4">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
              score >= 50 ? 'bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/10' : 'bg-amber-500/20 text-amber-400 ring-4 ring-amber-500/10'
            }`}>
              <Trophy size={40} />
            </div>
            
            <h2 className="text-2xl font-extrabold text-white">
              {score >= 50 ? (typeof activeLevel === 'number' && activeLevel < 8 ? `🎉 Level ${activeLevel} Passed! Level ${activeLevel + 1} Unlocked!` : '🏆 Assessment Mastered!') : '📚 Review and Try Again!'}
            </h2>
            <p className="text-slate-400 text-sm">
              You scored <strong className="text-white text-base font-bold">{score}%</strong> on {activeQuiz?.title} {typeof activeLevel === 'number' ? `(Level ${activeLevel})` : ''}
            </p>

            <div className="flex justify-center gap-3 pt-3 flex-wrap">
              <button 
                onClick={() => setPhase('levels')}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition-all"
              >
                Back to Level Map
              </button>
              <button 
                onClick={reset}
                className="rounded-xl bg-slate-800 border border-slate-700 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                All Topics List
              </button>
              <a 
                href="/student/subjects"
                className="rounded-xl bg-slate-800 border border-slate-700 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                Review Topic Notes
              </a>
            </div>
          </div>

          {/* Detailed Question Analysis */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Detailed Answer Analysis</h3>
            {evaluations.map((ev, i) => (
              <div key={i} className={`rounded-2xl border p-5 space-y-2 ${
                ev.isCorrect ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-red-500/30 bg-red-950/10'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-white text-sm">Q{i + 1}: {ev.questionText}</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    ev.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {ev.isCorrect ? 'Correct (+100)' : 'Incorrect (0)'}
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-300 pt-1">
                  <p><span className="text-slate-400 font-medium">Your answer:</span> <span className={ev.isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400'}>{ev.userAnswer}</span></p>
                  {!ev.isCorrect && (
                    <p><span className="text-slate-400 font-medium">Correct answer:</span> <span className="text-emerald-400 font-bold">{ev.correctAnswer}</span></p>
                  )}
                  <p className="text-slate-400 pt-1 text-[11px] leading-relaxed"><span className="text-slate-300 font-bold">Concept Explanation:</span> {ev.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
