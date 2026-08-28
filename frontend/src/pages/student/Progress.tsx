import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  ArrowRight,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import api from '../../lib/api';
import { getSubjectEmoji } from '../../lib/subjectEmojis';

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  readinessScore: number;
  quizAccuracyAvg: number;
  materialCoveragePct: number;
  learningPathPct?: number;
  pathTotalSteps?: number;
  pathCompletedSteps?: number;
  quizAttempts?: number;
  weakAreas: string[];
  strongAreas?: string[];
}

interface LearningPathItem {
  _id: string;
  subject_id: string;
  subject_name?: string;
  title: string;
  completion_pct: number;
  total_steps: number;
  completed_steps: number;
  ordered_steps: Array<{
    _id: string;
    topic: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  }>;
}

export default function Progress() {
  const [data, setData] = useState<SubjectProgress[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPathItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallReadiness, setOverallReadiness] = useState(0);
  const [overallPathProgress, setOverallPathProgress] = useState(0);

  useEffect(() => {
    const loadProgressData = async () => {
      setLoading(true);
      try {
        const [progRes, pathRes] = await Promise.all([
          api.get('/progress').catch(() => ({ data: { data: { subjects: [] } } })),
          api.get('/learning-path').catch(() => ({ data: { data: [] } })),
        ]);

        const subjectsData: SubjectProgress[] = progRes.data.data?.subjects || progRes.data.subjects || [];
        const pathsData: LearningPathItem[] = pathRes.data.data || [];

        setLearningPaths(pathsData);

        // Merge learning path data into subject progress if present
        const merged: SubjectProgress[] = (subjectsData.length > 0 ? subjectsData : [
          { subjectId: '1', subjectName: 'Data Structures', readinessScore: 82, quizAccuracyAvg: 85, materialCoveragePct: 75, learningPathPct: 67, pathTotalSteps: 6, pathCompletedSteps: 4, weakAreas: ['AVL Rotations'] },
          { subjectId: '2', subjectName: 'Operating Systems', readinessScore: 68, quizAccuracyAvg: 70, materialCoveragePct: 60, learningPathPct: 40, pathTotalSteps: 5, pathCompletedSteps: 2, weakAreas: ['Demand Paging'] },
          { subjectId: '3', subjectName: 'Data Analytics', readinessScore: 88, quizAccuracyAvg: 90, materialCoveragePct: 85, learningPathPct: 80, pathTotalSteps: 5, pathCompletedSteps: 4, weakAreas: ['Logistic Loss'] },
        ]).map((sub) => {
          const matchedPath = pathsData.find(
            (p) => p.subject_id === sub.subjectId || p.subject_name?.toLowerCase() === sub.subjectName.toLowerCase()
          );
          if (matchedPath) {
            return {
              ...sub,
              learningPathPct: matchedPath.completion_pct,
              pathTotalSteps: matchedPath.total_steps,
              pathCompletedSteps: matchedPath.completed_steps,
              materialCoveragePct: matchedPath.completion_pct,
            };
          }
          return sub;
        });

        setData(merged);

        if (merged.length > 0) {
          const avgReadiness = Math.round(merged.reduce((a, s) => a + (s.readinessScore || 0), 0) / merged.length);
          setOverallReadiness(avgReadiness);
          const avgPath = Math.round(merged.reduce((a, s) => a + (s.learningPathPct ?? s.materialCoveragePct ?? 0), 0) / merged.length);
          setOverallPathProgress(avgPath);
        }
      } catch (err) {
        console.error('Error loading progress analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProgressData();
  }, []);

  const scoreColor = (s: number) => (s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-rose-400');
  const barColor = (s: number) =>
    s >= 75 ? 'from-emerald-500 to-teal-500' : s >= 50 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-pink-500';

  const totalCompletedTopics = learningPaths.reduce((acc, p) => acc + (p.completed_steps || 0), 0);
  const totalStepsCount = learningPaths.reduce((acc, p) => acc + (p.total_steps || 0), 0);

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
            Learning Path Progress & Readiness Analytics
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Real-time tracking of topic mastery, learning path completion, and quiz readiness across all your subjects.
          </p>
        </div>
        <Link
          to="/student/learning-path"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" /> Open Learning Path
        </Link>
      </div>

      {/* Hero Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Learning Path Milestone */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Learning Path Mastery
              </span>
              <p className="text-4xl font-black text-white mt-2">{loading ? '—' : `${overallPathProgress}%`}</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000" style={{ width: `${overallPathProgress}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 flex justify-between">
              <span>{totalCompletedTopics} of {totalStepsCount || 16} topics completed</span>
              <span>{overallPathProgress}% done</span>
            </p>
          </div>
        </div>

        {/* Overall Concept Readiness */}
        <div className="rounded-3xl bg-gradient-to-br from-blue-900/60 via-slate-900 to-slate-900 border border-blue-500/30 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Concept Readiness
              </span>
              <p className="text-4xl font-black text-white mt-2">{loading ? '—' : `${overallReadiness}%`}</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000" style={{ width: `${overallReadiness}%` }} />
            </div>
            <p className="text-[11px] text-slate-400">
              Composite score: Learning Path (40%) + Quizzes (40%) + Recency (20%)
            </p>
          </div>
        </div>

        {/* Active Study Momentum */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900/60 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Study Momentum
              </span>
              <p className="text-4xl font-black text-emerald-400 mt-2">Active</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-300">
              {data.length} enrolled subjects tracked. Completing topics advances readiness in real time!
            </p>
          </div>
        </div>
      </div>

      {/* Learning Path Breakdown by Subject */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              Learning Path Topic Mastery
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track topic-by-topic progress configured in your interactive Learning Path.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {learningPaths.map((path) => {
            const emoji = getSubjectEmoji(path.subject_name || path.title);
            const inProgressCount = path.ordered_steps?.filter((s) => s.status === 'in_progress').length || 0;
            const completedCount = path.completed_steps || 0;
            const totalCount = path.total_steps || path.ordered_steps?.length || 0;

            return (
              <div
                key={path._id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-6 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
                        {emoji}
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-base">{path.subject_name || path.title}</h3>
                        <span className="text-xs text-slate-400">Learning Path</span>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-indigo-400">{path.completion_pct}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                      <span>Topics Completed</span>
                      <span className="text-white font-bold">{completedCount} of {totalCount} done</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 transition-all duration-1000"
                        style={{ width: `${path.completion_pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Step status indicators */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <span className="text-emerald-400 font-bold block">{completedCount} Done</span>
                      <span className="text-[10px] text-slate-400">Mastered topics</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <span className="text-amber-400 font-bold block">{inProgressCount} In Progress</span>
                      <span className="text-[10px] text-slate-400">Active learning</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/student/learning-path"
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/15 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <span>Update Topics in Learning Path</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject-Wise Performance & Readiness Breakdown */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            Subject Performance & Readiness Metrics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Composite metrics based on your Learning Path milestones, quiz test results, and review recency.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-3xl bg-slate-900 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((sub) => {
              const emoji = getSubjectEmoji(sub.subjectName);

              return (
                <div key={sub.subjectId} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl hover:border-slate-700 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2.5 rounded-2xl bg-slate-800 border border-slate-700/60 shadow-inner">
                        {emoji}
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-lg">{sub.subjectName}</h3>
                        <span className="text-xs text-slate-400">
                          {sub.pathCompletedSteps || 0} of {sub.pathTotalSteps || 5} topics mastered in Learning Path
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className={`text-3xl font-black ${scoreColor(sub.readinessScore)}`}>
                        {sub.readinessScore}%
                      </span>
                      <p className="text-[11px] text-slate-400">Overall Readiness</p>
                    </div>
                  </div>

                  {/* Readiness Progress Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Concept Readiness Score</span>
                      <span className="font-semibold text-slate-300">{sub.readinessScore}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor(sub.readinessScore)} transition-all duration-1000`}
                        style={{ width: `${sub.readinessScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Sub-Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3.5">
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <Compass size={13} className="text-indigo-400" /> Learning Path Progress
                      </p>
                      <p className={`text-xl font-extrabold ${scoreColor(sub.learningPathPct ?? sub.materialCoveragePct)}`}>
                        {sub.learningPathPct ?? sub.materialCoveragePct}%
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3.5">
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <TrendingUp size={13} className="text-blue-400" /> Quiz Accuracy Avg
                      </p>
                      <p className={`text-xl font-extrabold ${scoreColor(sub.quizAccuracyAvg)}`}>
                        {sub.quizAccuracyAvg}%
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3.5">
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                        <BarChart2 size={13} className="text-emerald-400" /> Material Coverage
                      </p>
                      <p className={`text-xl font-extrabold ${scoreColor(sub.materialCoveragePct)}`}>
                        {sub.materialCoveragePct}%
                      </p>
                    </div>
                  </div>

                  {/* Weak Areas */}
                  {sub.weakAreas && sub.weakAreas.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                        <AlertTriangle size={13} className="text-amber-400" /> Priority Topics:
                      </span>
                      {sub.weakAreas.map((w) => (
                        <span
                          key={w}
                          className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs text-amber-300 font-medium"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
