import { RecommendationModel, ProgressModel, QuizResultModel } from '../../models/index.js';
import { isMongoConnected } from '../../config/database.js';

const STATIC_RECOMMENDATIONS = [
  {
    topic: 'Graph Algorithms & Shortest Paths (Dijkstra, BFS/DFS)',
    subject: 'Data Structures',
    explanation: 'Master BFS, DFS, Dijkstra\'s, and Bellman-Ford algorithms. These are high-frequency exam topics with direct applications in networking, pathfinding, and graph search.',
    resources: [
      { title: 'Graph Data Structures & Algorithms — GeeksForGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/' },
      { title: 'Graph Theory & Shortest Paths — MIT OpenCourseWare 6.006', type: 'course', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/' },
      { title: 'Interactive Graph Visualizer — VisuAlgo', type: 'article', url: 'https://visualgo.net/en/sssp' },
    ]
  },
  {
    topic: 'Dynamic Programming & Memoization Patterns',
    subject: 'Data Structures',
    explanation: 'DP is critical for solving complex sub-problem optimizations. Master 0/1 Knapsack, Longest Common Subsequence (LCS), and Interval Scheduling.',
    resources: [
      { title: 'Dynamic Programming Comprehensive Guide — GeeksForGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/dynamic-programming/' },
      { title: 'Dynamic Programming Course — freeCodeCamp', type: 'video', url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk' },
      { title: 'LeetCode Core DP Patterns Collection', type: 'article', url: 'https://leetcode.com/discuss/general-discussion/458695/Dynamic-Programming-Patterns' },
    ]
  },
  {
    topic: 'Memory Management, Paging & Virtual Memory',
    subject: 'Operating Systems',
    explanation: 'Understand multi-level paging, segmentation, TLB caching, and page replacement algorithms (LRU, FIFO, Clock). Essential for core OS performance.',
    resources: [
      { title: 'Operating System Concepts — Silberschatz, Galvin, Gagne', type: 'book', url: 'https://os-book.com/' },
      { title: 'Virtual Memory & Page Replacement — GeeksForGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/page-replacement-algorithms-in-operating-systems/' },
      { title: 'Memory Management Architecture — MIT 6.828', type: 'course', url: 'https://pdos.csail.mit.edu/6.828/' },
    ]
  },
  {
    topic: 'Process Synchronization, Mutexes & Deadlock Prevention',
    subject: 'Operating Systems',
    explanation: 'Master semaphores, Peterson\'s solution, Coffman conditions for deadlock, and Banker\'s algorithm for safe resource allocation.',
    resources: [
      { title: 'Process Synchronization & Semaphores — GeeksForGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/introduction-of-process-synchronization/' },
      { title: 'Deadlock Handling & Bankers Algorithm — TutorialsPoint', type: 'article', url: 'https://www.tutorialspoint.com/operating_system/os_deadlocks.htm' },
      { title: 'Deadlocks Explained — Computerphile', type: 'video', url: 'https://www.youtube.com/watch?v=_Ak4EDvh2dI' },
    ]
  },
  {
    topic: 'Linear & Logistic Regression with Regularization',
    subject: 'Data Analytics',
    explanation: 'Foundation of predictive statistical modeling. Study cost functions, gradient descent optimization, Ridge/Lasso regularization, and ROC/AUC metrics.',
    resources: [
      { title: 'Machine Learning Specialization — Andrew Ng (Coursera/DeepLearning.AI)', type: 'course', url: 'https://www.coursera.org/learn/machine-learning' },
      { title: 'Scikit-Learn Generalized Linear Models Guide', type: 'article', url: 'https://scikit-learn.org/stable/modules/linear_model.html' },
      { title: 'Statistical Regression Analysis — Khan Academy', type: 'course', url: 'https://www.khanacademy.org/math/statistics-probability/describing-relationships-quantitative-data' },
    ]
  },
  {
    topic: 'Hypothesis Testing, P-Values & Statistical Inference',
    subject: 'Data Analytics',
    explanation: 'Key for evidence-based conclusions. Focus on Null vs. Alternative Hypothesis, Z-Tests, T-Tests, ANOVA, and Chi-Square tests.',
    resources: [
      { title: 'StatQuest: Hypothesis Testing & P-Values Explained', type: 'video', url: 'https://statquest.org/' },
      { title: 'Engineering Statistics Handbook — NIST/SEMATECH', type: 'book', url: 'https://www.itl.nist.gov/div898/handbook/' },
      { title: 'Statistical Inference Guide — Khan Academy', type: 'course', url: 'https://www.khanacademy.org/math/statistics-probability/significance-tests-one-sample' },
    ]
  },
  {
    topic: 'Database Indexing (B+ Trees) & ACID Transactions',
    subject: 'Database Systems',
    explanation: 'Crucial for database scalability. Master B-Tree index lookups, query plan execution with EXPLAIN, and 2-Phase Locking for ACID compliance.',
    resources: [
      { title: 'PostgreSQL Official Indexing & Performance Manual', type: 'article', url: 'https://www.postgresql.org/docs/current/indexes.html' },
      { title: 'Use The Index, Luke! — SQL Indexing Performance Guide', type: 'book', url: 'https://use-the-index-luke.com/' },
      { title: 'ACID Properties in DBMS — GeeksForGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/acid-properties-in-dbms/' },
    ]
  },
  {
    topic: 'TCP/IP 3-Way Handshake, Flow & Congestion Control',
    subject: 'Computer Networks',
    explanation: 'Deep dive into connection establishment, sliding window flow control, TCP Slow Start, and Congestion Avoidance algorithms (Reno, CUBIC).',
    resources: [
      { title: 'What is the TCP/IP Model? — Cloudflare Learning Center', type: 'article', url: 'https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/' },
      { title: 'Stanford CS144: Introduction to Computer Networking', type: 'course', url: 'https://cs144.github.io/' },
      { title: 'IETF RFC 793 Transmission Control Protocol Specification', type: 'article', url: 'https://datatracker.ietf.org/doc/html/rfc793' },
    ]
  },
];

export class RecommendationsService {
  async getRecommendations(userId: string) {
    if (isMongoConnected) {
      const existing = await RecommendationModel.find({ user_id: userId })
        .sort({ generated_at: -1 })
        .limit(10)
        .lean();

      if (existing.length > 0) {
        const lastGenerated = new Date(existing[0].generated_at || 0);
        const daysSince = (Date.now() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSince < 3) {
          return { recommendations: existing };
        }
      }

      // Generate fresh recommendations
      return this.generateRecommendations(userId);
    }

    return { recommendations: STATIC_RECOMMENDATIONS };
  }

  async generateRecommendations(userId: string) {
    let weakTopics: string[] = [];

    if (isMongoConnected) {
      const progressList = await ProgressModel.find({ user_id: userId }).lean();
      progressList.forEach((p: any) => {
        if (p.weak_topics?.length) weakTopics.push(...p.weak_topics);
      });

      if (weakTopics.length === 0) {
        const recentResults = await QuizResultModel.find({ user_id: userId })
          .sort({ taken_at: -1 })
          .limit(5)
          .lean();
        recentResults.forEach((r: any) => {
          if (r.weak_topics?.length) weakTopics.push(...r.weak_topics);
        });
      }
    }

    const uniqueWeak = Array.from(new Set(weakTopics)).slice(0, 3);

    // Build per-user recommendations
    const recs = STATIC_RECOMMENDATIONS.map(r => ({
      ...r,
      user_id: userId,
      generated_at: new Date(),
    }));

    if (isMongoConnected) {
      // Delete old recommendations and save fresh ones
      await RecommendationModel.deleteMany({ user_id: userId });
      await RecommendationModel.insertMany(recs);
    }

    return { recommendations: recs, weak_topics: uniqueWeak };
  }
}

export const recommendationsService = new RecommendationsService();
