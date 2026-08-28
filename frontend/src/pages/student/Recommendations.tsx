import { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, ExternalLink, RefreshCcw, Loader2, Lightbulb, Video, FileText, GraduationCap } from 'lucide-react';
import api from '../../lib/api';

interface Resource {
  title: string;
  type: 'book' | 'video' | 'article' | 'course';
  url: string;
}

interface Recommendation {
  _id?: string;
  topic: string;
  subject: string;
  explanation: string;
  resources: Resource[];
  generated_at?: string;
}

const FALLBACK_RECS: Recommendation[] = [
  {
    topic: 'Graph Algorithms & Shortest Paths (Dijkstra, BFS/DFS)',
    subject: 'Data Structures',
    explanation: 'Master BFS, DFS, Dijkstra\'s, and Bellman-Ford algorithms. High-frequency exam topics with applications in pathfinding and networks.',
    resources: [
      { title: 'Graph Data Structures & Algorithms — GeeksForGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/' },
      { title: 'Graph Theory & Algorithms — MIT OpenCourseWare 6.006', type: 'course', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/' },
      { title: 'Interactive Graph Traversal Visualizer — VisuAlgo', type: 'article', url: 'https://visualgo.net/en/sssp' },
    ]
  },
  {
    topic: 'Dynamic Programming & Memoization Patterns',
    subject: 'Data Structures',
    explanation: 'DP is critical for solving sub-problem optimizations. Master 0/1 Knapsack, LCS, and Interval Scheduling.',
    resources: [
      { title: 'Dynamic Programming Comprehensive Guide — GeeksForGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/dynamic-programming/' },
      { title: 'Dynamic Programming Course — freeCodeCamp', type: 'video', url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk' },
      { title: 'LeetCode Core DP Patterns Collection', type: 'article', url: 'https://leetcode.com/discuss/general-discussion/458695/Dynamic-Programming-Patterns' },
    ]
  },
  {
    topic: 'Virtual Memory, Multi-Level Paging & Page Replacement',
    subject: 'Operating Systems',
    explanation: 'Understand paging, segmentation, TLB caches, and page replacement algorithms (LRU, FIFO, Clock).',
    resources: [
      { title: 'Operating System Concepts — Silberschatz', type: 'book', url: 'https://os-book.com/' },
      { title: 'Page Replacement Algorithms — GeeksForGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/page-replacement-algorithms-in-operating-systems/' },
      { title: 'Memory Management — MIT 6.828', type: 'course', url: 'https://pdos.csail.mit.edu/6.828/' },
    ]
  },
  {
    topic: 'Process Synchronization, Mutexes & Deadlock Prevention',
    subject: 'Operating Systems',
    explanation: 'Master semaphores, Peterson\'s solution, Coffman deadlock conditions, and Banker\'s algorithm.',
    resources: [
      { title: 'Process Synchronization & Semaphores — GeeksForGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/introduction-of-process-synchronization/' },
      { title: 'Deadlocks & Banker\'s Algorithm — TutorialsPoint', type: 'article', url: 'https://www.tutorialspoint.com/operating_system/os_deadlocks.htm' },
    ]
  },
  {
    topic: 'Linear & Logistic Regression with Regularization',
    subject: 'Data Analytics',
    explanation: 'Foundational statistical modeling. Study cost functions, gradient descent, Ridge/Lasso regularization, and ROC/AUC metrics.',
    resources: [
      { title: 'Machine Learning Specialization — Andrew Ng (Coursera)', type: 'course', url: 'https://www.coursera.org/learn/machine-learning' },
      { title: 'Generalized Linear Models — Scikit-Learn Docs', type: 'article', url: 'https://scikit-learn.org/stable/modules/linear_model.html' },
      { title: 'Regression Analysis — Khan Academy', type: 'course', url: 'https://www.khanacademy.org/math/statistics-probability/describing-relationships-quantitative-data' },
    ]
  },
  {
    topic: 'Hypothesis Testing, P-Values & Statistical Inference',
    subject: 'Data Analytics',
    explanation: 'Focus on Null vs. Alternative Hypothesis, Z-Tests, T-Tests, ANOVA, and Chi-Square distribution tests.',
    resources: [
      { title: 'StatQuest: Hypothesis Testing & P-Values Explained', type: 'video', url: 'https://statquest.org/' },
      { title: 'Engineering Statistics Handbook — NIST/SEMATECH', type: 'book', url: 'https://www.itl.nist.gov/div898/handbook/' },
    ]
  },
  {
    topic: 'Database Indexing (B+ Trees) & ACID Transactions',
    subject: 'Database Systems',
    explanation: 'Crucial for database scalability. Master B-Tree index lookups, query plan execution with EXPLAIN, and 2-Phase Locking for ACID compliance.',
    resources: [
      { title: 'PostgreSQL Indexing Manual', type: 'article', url: 'https://www.postgresql.org/docs/current/indexes.html' },
      { title: 'Use The Index, Luke! SQL Performance Guide', type: 'book', url: 'https://use-the-index-luke.com/' },
    ]
  },
  {
    topic: 'TCP/IP 3-Way Handshake, Flow & Congestion Control',
    subject: 'Computer Networks',
    explanation: 'Connection establishment, sliding window flow control, TCP Slow Start, and Congestion Avoidance algorithms.',
    resources: [
      { title: 'What is the TCP/IP Model? — Cloudflare Learning Center', type: 'article', url: 'https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/' },
      { title: 'Stanford CS144: Computer Networking', type: 'course', url: 'https://cs144.github.io/' },
    ]
  },
];

const PRIORITY_COLORS: Record<string, string> = {
  'Data Structures': 'from-red-500 to-pink-600',
  'Operating Systems': 'from-amber-500 to-orange-600',
  'Data Analytics': 'from-blue-500 to-indigo-600',
};

const RESOURCE_ICONS: Record<string, any> = {
  book: BookOpen,
  video: Video,
  article: FileText,
  course: GraduationCap,
};

const RESOURCE_LABELS: Record<string, string> = {
  book: 'Book',
  video: 'Video',
  article: 'Article',
  course: 'Course',
};

export default function Recommendations() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const fetchRecommendations = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data } = await api.get(`/recommendations${forceRefresh ? '?refresh=true' : ''}`);
      const fetched = data.data?.recommendations || data.data || [];
      setRecs(Array.isArray(fetched) && fetched.length > 0 ? fetched : FALLBACK_RECS);
    } catch {
      setRecs(FALLBACK_RECS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <Loader2 className="animate-spin text-blue-400 mr-3" />
        <span className="text-slate-400">Loading personalized recommendations...</span>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Recommendations</h1>
          <p className="text-slate-400 mt-1">Personalized study suggestions based on your performance</p>
        </div>
        <button
          onClick={() => fetchRecommendations(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-blue-500 text-sm font-medium transition-all disabled:opacity-40"
        >
          <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Topic Recommendations */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Suggested Topics</h2>
        <div className="space-y-3">
          {recs.map((rec, i) => {
            const gradColor = PRIORITY_COLORS[rec.subject] || 'from-purple-500 to-blue-600';
            const isExpanded = expandedIdx === i;
            return (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-600 transition-all"
              >
                <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${gradColor}`} />
                {/* Header row */}
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : i)}
                  className="w-full pl-5 pr-4 py-4 flex items-start justify-between gap-4 text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Lightbulb size={14} className="text-amber-400" />
                      <p className="font-semibold text-white">{rec.topic}</p>
                    </div>
                    <p className="text-xs text-slate-400">{rec.subject}</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className={`text-slate-600 group-hover:text-blue-400 transition-all mt-1 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="pl-5 pr-4 pb-4 border-t border-slate-800 mt-0 pt-3">
                    <p className="text-sm text-slate-300 mb-4">{rec.explanation}</p>

                    {rec.resources && rec.resources.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-semibold">Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.resources.map((res, ri) => {
                            const Icon = RESOURCE_ICONS[res.type] || BookOpen;
                            const label = RESOURCE_LABELS[res.type] || res.type;
                            return (
                              <a
                                key={ri}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 text-xs font-medium transition-all"
                              >
                                <Icon size={12} />
                                {res.title}
                                <span className="opacity-60 text-[10px] uppercase">{label}</span>
                                <ExternalLink size={10} className="opacity-60" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* All Resources flat list */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">All Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recs.flatMap(rec => rec.resources || []).map((res, i) => {
            const Icon = RESOURCE_ICONS[res.type] || BookOpen;
            return (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-blue-500/40 hover:bg-slate-800 transition-all flex flex-col gap-2"
              >
                <div className="mb-1 rounded-lg bg-blue-500/10 p-2.5 w-fit text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <Icon size={18} />
                </div>
                <p className="font-semibold text-white text-sm leading-snug">{res.title}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">{res.type}</span>
                  <ExternalLink size={12} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
