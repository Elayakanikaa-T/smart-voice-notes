import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Sparkles, 
  BookOpen, 
  Trash2, 
  Search, 
  Check, 
  TrendingUp, 
  Target, 
  Compass, 
  X,
  Brain,
  Trophy,
  ArrowRight,
  Zap,
  Timer
} from 'lucide-react';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { getSubjectEmoji } from '../../lib/subjectEmojis';

interface LearningStep {
  _id: string;
  order: number;
  topic: string;
  description?: string;
  resource_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  estimated_minutes: number;
  completed_at?: string;
}

interface LearningPathItem {
  _id: string;
  user_id: string;
  subject_id: string;
  subject_name?: string;
  title: string;
  description?: string;
  exam_date?: string;
  ordered_steps: LearningStep[];
  total_steps: number;
  completed_steps: number;
  completion_pct: number;
  estimated_total_minutes: number;
  is_active: boolean;
  generated_at: string;
}

export default function LearningPath() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState<LearningPathItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Topic Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSubject, setNewTopicSubject] = useState('Data Structures');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [newTopicStatus, setNewTopicStatus] = useState<'pending' | 'in_progress' | 'completed'>('in_progress');
  const [newTopicMinutes, setNewTopicMinutes] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Quiz notification modal state
  const [quizModal, setQuizModal] = useState<{
    open: boolean;
    topicName: string;
    subjectName: string;
    subjectId: string;
    quizId: string | null;
    deadline: string;
    generating: boolean;
  }>({ open: false, topicName: '', subjectName: '', subjectId: '', quizId: null, deadline: '', generating: false });

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/learning-path');
      if (data.success && Array.isArray(data.data)) {
        setPaths(data.data);
        if (data.data.length > 0 && !selectedPathId) {
          setSelectedPathId(data.data[0]._id);
          setNewTopicSubject(data.data[0].subject_name || 'Data Structures');
        }
      }
    } catch (err) {
      console.error('Failed to load learning paths:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate quiz questions from topic title (client-side template)
  const buildTopicQuizQuestions = (topic: string, subject: string) => {
    const t = topic.trim();
    const s = subject || 'the subject';
    return [
      {
        question: `What is the primary concept behind "${t}"?`,
        options: [
          `A fundamental technique in ${s} for optimising data handling`,
          `A method to reduce algorithm complexity to O(1)`,
          `An approach used only in hardware-level programming`,
          `A design pattern exclusive to object-oriented languages`
        ],
        correctIndex: 0,
        explanation: `"${t}" is a core concept in ${s} that enables efficient data handling and problem-solving.`
      },
      {
        question: `Which of the following best describes the time complexity typically associated with "${t}"?`,
        options: [`O(1)`, `O(log n)`, `O(n log n)`, `O(n²)`],
        correctIndex: 1,
        explanation: `Most algorithms related to ${t} operate in O(log n) or better in optimised implementations.`
      },
      {
        question: `In the context of "${t}", which operation is considered most critical?`,
        options: [`Search / Lookup`, `Insertion`, `Deletion`, `Traversal`],
        correctIndex: 0,
        explanation: `Search is the most frequently performed operation in ${t} scenarios.`
      },
      {
        question: `Which real-world application directly benefits from "${t}"?`,
        options: [
          `Database indexing and search engines`,
          `Audio signal processing`,
          `Image compression only`,
          `Network packet routing exclusively`
        ],
        correctIndex: 0,
        explanation: `${t} is extensively used in database indexing and information retrieval systems.`
      },
      {
        question: `A key advantage of mastering "${t}" is:`,
        options: [
          `Ability to solve complex ${s} problems efficiently`,
          `Elimination of all runtime errors`,
          `Guaranteeing 100% test coverage automatically`,
          `Removing the need for data validation`
        ],
        correctIndex: 0,
        explanation: `Mastering ${t} gives you a strong foundation to tackle real-world ${s} challenges.`
      }
    ];
  };

  const generateAndShowQuizModal = async (topicName: string, path: LearningPathItem) => {
    // Deadline = 24 hours from now
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const deadlineStr = deadline.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    setQuizModal({ open: true, topicName, subjectName: path.subject_name || 'General', subjectId: path.subject_id, quizId: null, deadline: deadlineStr, generating: true });

    try {
      const questions = buildTopicQuizQuestions(topicName, path.subject_name || 'General');
      const { data } = await api.post('/quizzes', {
        subjectId: path.subject_id,
        title: `Quiz: ${topicName}`,
        difficulty: 'medium',
        questions,
      });
      const quizId = data?.data?.id || data?.data?.quizId || data?.id || null;
      setQuizModal(prev => ({ ...prev, quizId, generating: false }));
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      setQuizModal(prev => ({ ...prev, generating: false }));
    }
  };

  const handleStatusChange = async (pathId: string, stepId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    // Find topic name and path before updating
    let completedTopicName = '';
    let completedPath: LearningPathItem | undefined;
    setPaths(prev => {
      const updated = prev.map(p => {
        if (p._id !== pathId) return p;
        completedPath = p;
        const updatedSteps = p.ordered_steps.map(s => {
          if (s._id === stepId) {
            completedTopicName = s.topic;
            return { ...s, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined };
          }
          return s;
        });
        const completed = updatedSteps.filter(s => s.status === 'completed').length;
        const total = updatedSteps.length;
        return {
          ...p,
          ordered_steps: updatedSteps,
          completed_steps: completed,
          completion_pct: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      });
      return updated;
    });

    try {
      await api.patch(`/learning-path/${pathId}/steps/${stepId}`, { status: newStatus });
      if (newStatus === 'completed' && completedTopicName && completedPath) {
        // Trigger quiz notification modal
        await generateAndShowQuizModal(completedTopicName, completedPath);
      } else {
        triggerSuccessMessage(`Status updated to ${newStatus === 'in_progress' ? 'In Progress' : 'Not Started'}!`);
      }
    } catch (err) {
      console.error('Failed to update topic status:', err);
      fetchLearningPaths();
    }
  };

  const handleDeleteStep = async (pathId: string, stepId: string) => {
    if (!window.confirm('Are you sure you want to remove this topic from your learning path?')) return;
    
    setPaths(prev => prev.map(p => {
      if (p._id !== pathId) return p;
      const updatedSteps = p.ordered_steps.filter(s => s._id !== stepId);
      const completed = updatedSteps.filter(s => s.status === 'completed').length;
      const total = updatedSteps.length;
      return {
        ...p,
        ordered_steps: updatedSteps,
        total_steps: total,
        completed_steps: completed,
        completion_pct: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }));

    try {
      await api.delete(`/learning-path/${pathId}/steps/${stepId}`);
      triggerSuccessMessage('Topic removed from path.');
    } catch (err) {
      console.error('Failed to delete step:', err);
      fetchLearningPaths();
    }
  };

  const handleAddTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        path_id: selectedPathId || undefined,
        subject_name: newTopicSubject,
        topic: newTopicName.trim(),
        description: newTopicDescription.trim() || undefined,
        status: newTopicStatus,
        estimated_minutes: newTopicMinutes || 30,
      };

      const { data } = await api.post('/learning-path/topics', payload);
      if (data.success) {
        setIsAddModalOpen(false);
        setNewTopicName('');
        setNewTopicDescription('');
        setNewTopicStatus('in_progress');
        triggerSuccessMessage(`Topic "${newTopicName.trim()}" added successfully!`);
        fetchLearningPaths();
      }
    } catch (err: any) {
      console.error('Failed to add topic:', err);
      alert(err.response?.data?.error || err.message || 'Failed to add topic.');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerSuccessMessage = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const allSteps = paths.flatMap(p => p.ordered_steps);
  const totalTopics = allSteps.length;
  const completedTopics = allSteps.filter(s => s.status === 'completed').length;
  const inProgressTopics = allSteps.filter(s => s.status === 'in_progress').length;
  const overallPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const getSubjectGradient = (name: string = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('data structure') || lower.includes('algorithm')) return 'from-indigo-600 to-blue-700';
    if (lower.includes('operating') || lower.includes('system')) return 'from-purple-600 to-pink-700';
    if (lower.includes('analytic') || lower.includes('data')) return 'from-emerald-600 to-teal-700';
    if (lower.includes('network') || lower.includes('web')) return 'from-sky-600 to-cyan-700';
    if (lower.includes('math') || lower.includes('statistic')) return 'from-amber-600 to-orange-700';
    if (lower.includes('database') || lower.includes('sql')) return 'from-rose-600 to-pink-700';
    return 'from-violet-600 to-indigo-700';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-900/40 border border-emerald-400/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="w-5 h-5" />
          <span className="text-sm font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* ✅ Quiz Notification Modal - appears when topic marked Done */}
      {quizModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
          <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-emerald-500/30">
            {/* Gradient top banner */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">🎉 Topic Completed!</h2>
                <p className="text-white/80 text-sm font-medium">Great work mastering this topic</p>
              </div>
            </div>

            {/* Body */}
            <div className="bg-slate-900 p-6">
              {/* Topic name */}
              <div className="mb-5 p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Completed Topic</p>
                <p className="text-base font-bold text-white">{quizModal.topicName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{quizModal.subjectName}</p>
              </div>

              {/* Quiz challenge banner */}
              <div className="mb-5 p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 mt-0.5">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-0.5">🧠 Knowledge Verification Quiz Ready!</p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      We've auto-generated a <strong className="text-indigo-300">5-question quiz</strong> on <em>"{quizModal.topicName}"</em>. Test yourself now to reinforce retention!
                    </p>
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="mb-5 flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <Timer className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-300">⏰ Deadline: {quizModal.deadline}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Complete within 24 hours for best retention</p>
                </div>
              </div>

              {/* Generating state */}
              {quizModal.generating && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 mb-4">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Generating personalised quiz questions...</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setQuizModal(prev => ({ ...prev, open: false }));
                    if (quizModal.quizId) {
                      navigate(`/student/quizzes/${quizModal.quizId}`);
                    } else {
                      navigate('/student/quizzes');
                    }
                  }}
                  disabled={quizModal.generating}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-60 active:scale-[0.98]"
                >
                  {quizModal.generating ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Preparing Quiz...</span></>
                  ) : (
                    <><Zap className="w-4 h-4" /><span>Take Quiz Now</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <button
                  onClick={() => {
                    setQuizModal(prev => ({ ...prev, open: false }));
                    triggerSuccessMessage('Quiz scheduled — remember to complete it before the deadline!');
                  }}
                  className="w-full py-3 px-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 text-sm font-semibold transition-all"
                >
                  Remind Me Later
                </button>
              </div>

              {/* Skip */}
              <button
                onClick={() => setQuizModal(prev => ({ ...prev, open: false }))}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 text-white/60 hover:text-white hover:bg-black/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Learning Path Tracker</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Your Study Journey</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your milestones, add custom study topics, and update your progress seamlessly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (paths.length > 0 && !selectedPathId) setSelectedPathId(paths[0]._id);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Topic</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{overallPercentage}%</span>
            <span className="text-xs text-slate-400">mastery</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${overallPercentage}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Total Topics</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalTopics}</span>
            <span className="text-xs text-slate-400">across {paths.length} subjects</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Curated & custom topics</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{inProgressTopics}</span>
            <span className="text-xs text-slate-400">active now</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Currently studying</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Completed (Done)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{completedTopics}</span>
            <span className="text-xs text-slate-400">mastered</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Verified completed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Status Filter Tabs */}
        <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Topics ({totalTopics})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterStatus === 'in_progress' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            In Progress ({inProgressTopics})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterStatus === 'completed' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Done ({completedTopics})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'pending' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Not Started ({totalTopics - completedTopics - inProgressTopics})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Learning Paths List */}
      {!loading && paths.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No learning paths found</h3>
          <p className="text-sm text-slate-400 mb-6">Create your first custom study topic to kickstart your journey.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Topic Now</span>
          </button>
        </div>
      )}

      {!loading && paths.length > 0 && (
        <div className="space-y-8">
          {paths.map(path => {
            const filteredSteps = path.ordered_steps.filter(step => {
              if (filterStatus !== 'all' && step.status !== filterStatus) return false;
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                  step.topic.toLowerCase().includes(q) ||
                  (step.description && step.description.toLowerCase().includes(q))
                );
              }
              return true;
            });

            if (filteredSteps.length === 0 && (filterStatus !== 'all' || searchQuery.trim())) {
              return null;
            }

            return (
              <div 
                key={path._id} 
                className="rounded-3xl border border-slate-800/80 bg-slate-900/90 overflow-hidden shadow-xl shadow-slate-950/40 backdrop-blur-md transition-all duration-300 hover:border-slate-700/80"
              >
                {/* Header Card */}
                <div className={`bg-gradient-to-r ${getSubjectGradient(path.subject_name || path.title)} p-6 sm:p-7 relative overflow-hidden`}>
                  <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 text-white/90 text-xs font-semibold backdrop-blur-sm mb-2">
                        <span className="text-base leading-none">{getSubjectEmoji(path.subject_name || path.title)}</span>
                        <span>{path.subject_name || 'Core Curriculum'}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{path.title}</h2>
                      {path.description && (
                        <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-2xl">{path.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-start sm:self-center">
                      <div className="text-right">
                        <div className="flex items-baseline gap-1 justify-end">
                          <span className="text-3xl font-black text-white">{path.completion_pct}%</span>
                        </div>
                        <span className="text-xs text-white/80 font-medium">
                          {path.completed_steps} of {path.total_steps} topics done
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPathId(path._id);
                          setNewTopicSubject(path.subject_name || 'General');
                          setIsAddModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-sm border border-white/20 transition-all flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Topic</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-5 h-2.5 w-full rounded-full bg-black/30 overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className="h-full rounded-full bg-white transition-all duration-700 shadow-sm"
                      style={{ width: `${path.completion_pct}%` }} 
                    />
                  </div>
                </div>

                {/* Topics Flow */}
                <div className="p-6 sm:p-8">
                  <div className="relative">
                    {/* Continuous vertical roadmap connecting line */}
                    <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-slate-700 via-slate-800 to-transparent z-0 hidden sm:block" />

                    <div className="space-y-4">
                      {filteredSteps.map((step, idx) => {
                        const isDone = step.status === 'completed';
                        const isInProgress = step.status === 'in_progress';
                        const isPending = step.status === 'pending' || step.status === 'skipped';

                        return (
                          <div
                            key={step._id || idx}
                            className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 z-10 ${
                              isDone 
                                ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-700/60' 
                                : isInProgress
                                ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-700/60 shadow-lg shadow-amber-950/20'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {/* Left indicator & Topic details */}
                            <div className="flex items-start gap-4">
                              {/* Step circle indicator */}
                              <div className="flex-shrink-0 mt-0.5">
                                {isDone ? (
                                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/20">
                                    <Check className="w-5 h-5 stroke-[3]" />
                                  </div>
                                ) : isInProgress ? (
                                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 animate-pulse shadow-md shadow-amber-500/20">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-500">
                                    <Circle className="w-4 h-4" />
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h4 className={`text-base font-semibold transition-colors ${
                                    isDone ? 'text-slate-300 line-through decoration-slate-500 decoration-2' : 'text-white'
                                  }`}>
                                    {step.topic}
                                  </h4>
                                  
                                  {/* Current Status Badge */}
                                  {isDone && (
                                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                      ✓ Done
                                    </span>
                                  )}
                                  {isInProgress && (
                                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                                      ⏳ In Progress
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                      ⚪ Not Started
                                    </span>
                                  )}
                                </div>

                                {step.description && (
                                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                                    {step.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {step.estimated_minutes || 30} mins
                                  </span>
                                  {step.completed_at && (
                                    <span className="text-emerald-500/80">
                                      Completed {new Date(step.completed_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Actions: Interactive Status Selector Buttons */}
                            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center pl-12 sm:pl-0">
                              {/* Status Action Buttons */}
                              <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(path._id, step._id, 'pending')}
                                  title="Mark Not Started"
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    isPending 
                                      ? 'bg-slate-800 text-slate-200 shadow' 
                                      : 'text-slate-500 hover:text-slate-300'
                                  }`}
                                >
                                  Not Started
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(path._id, step._id, 'in_progress')}
                                  title="Mark In Progress"
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                                    isInProgress 
                                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' 
                                      : 'text-slate-500 hover:text-amber-400'
                                  }`}
                                >
                                  In Progress
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(path._id, step._id, 'completed')}
                                  title="Mark as Done"
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                                    isDone 
                                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                                      : 'text-slate-500 hover:text-emerald-400'
                                  }`}
                                >
                                  ✓ Done
                                </button>
                              </div>

                              {/* Delete Step Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteStep(path._id, step._id)}
                                title="Remove topic"
                                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-80 hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Topic Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add Topic to Learning Path</h3>
                  <p className="text-xs text-slate-400">Enter a custom topic and set its initial progress state.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTopicSubmit} className="space-y-4">
              {/* Target Subject / Path */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Select Subject / Path
                </label>
                <select
                  value={selectedPathId}
                  onChange={e => {
                    setSelectedPathId(e.target.value);
                    const selected = paths.find(p => p._id === e.target.value);
                    if (selected?.subject_name) setNewTopicSubject(selected.subject_name);
                  }}
                  className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  {paths.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.subject_name || p.title} ({p.completed_steps}/{p.total_steps} completed)
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Topic Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Red-Black Trees & AVL Rotations"
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Initial Status
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setNewTopicStatus('pending')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                      newTopicStatus === 'pending'
                        ? 'bg-slate-800 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚪ Not Started
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTopicStatus('in_progress')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                      newTopicStatus === 'in_progress'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                        : 'text-slate-400 hover:text-amber-400'
                    }`}
                  >
                    🟡 In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTopicStatus('completed')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                      newTopicStatus === 'completed'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-emerald-400'
                    }`}
                  >
                    🟢 Done
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Topic Description or Goals (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Key subtopics, lecture references, or notes to review..."
                  value={newTopicDescription}
                  onChange={e => setNewTopicDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Estimated Minutes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Estimated Study Time (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={newTopicMinutes}
                  onChange={e => setNewTopicMinutes(parseInt(e.target.value, 10) || 30)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newTopicName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Adding Topic...' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

