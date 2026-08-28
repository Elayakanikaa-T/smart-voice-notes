import { config } from '../../../backend/src/config/env.js';
import { logger } from '../../../backend/src/utils/logger.js';

export interface AISummaryResult {
  summaryText: string;
  bulletPoints: string[];
  keyTakeaways: string[];
  keywords: Array<{ term: string; definition: string; importance: number; category?: string }>;
  datesDetected: Array<{ dateString: string; parsedDate?: string; context: string; isExamOrDeadline: boolean }>;
  entities: Array<{ name: string; category: string }>;
  suggestedSubject: string;
  suggestedTags: string[];
  readingTimeMinutes: number;
}

export interface FlashcardItem {
  cardId: string;
  frontQuestion: string;
  backAnswer: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topicTag: string;
}

export interface QuizQuestionItem {
  questionId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topicTag: string;
  bloomTaxonomyLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate';
}

export interface ILLMProvider {
  generateSummary(transcript: string, title?: string): Promise<AISummaryResult>;
  generateFlashcards(transcript: string, count?: number): Promise<FlashcardItem[]>;
  generateQuiz(transcript: string, count?: number, difficulty?: string): Promise<QuizQuestionItem[]>;
}

export class MockLLMProvider implements ILLMProvider {
  async generateSummary(transcript: string, title?: string): Promise<AISummaryResult> {
    logger.info(`[LLM:Mock] Generating AI summary for lecture note...`);
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      summaryText:
        'This lecture examined shortest path graph algorithms, contrasting Dijkstra’s greedy approach with A* heuristic search. Key constraints such as non-negative edge weights and priority queue data structures were evaluated alongside algorithmic complexities. An upcoming midterm exam date was also announced.',
      bulletPoints: [
        'Dijkstra’s algorithm finds single-source shortest paths in weighted graphs with non-negative edge weights.',
        'Negative edge weights cause Dijkstra to fail; Bellman-Ford algorithm should be used instead.',
        'Binary min-heap implementation achieves O((V + E) log V) time complexity.',
        'Fibonacci heap implementation reduces asymptotic runtime to O(E + V log V).',
        'A* enhances search efficiency by incorporating an admissible heuristic function h(n).',
      ],
      keyTakeaways: [
        'Always ensure edge weights are non-negative before applying Dijkstra.',
        'Choose priority queue implementations based on graph density (sparse vs dense).',
        'Admissibility of heuristic ensures A* optimality.',
      ],
      keywords: [
        {
          term: 'Dijkstra’s Algorithm',
          definition: 'A greedy algorithm that computes single-source shortest paths on graphs with non-negative weights.',
          importance: 5,
          category: 'Algorithm',
        },
        {
          term: 'Priority Queue / Min-Heap',
          definition: 'An abstract data type where each element has a priority, used to extract minimum distance vertices in O(log V).',
          importance: 4,
          category: 'Data Structure',
        },
        {
          term: 'Heuristic Admissibility',
          definition: 'The property that a heuristic function never overestimates the actual cost to reach the goal in A* search.',
          importance: 4,
          category: 'Concept',
        },
        {
          term: 'Bellman-Ford Algorithm',
          definition: 'An algorithm that computes shortest paths and detects negative weight cycles in O(V * E).',
          importance: 3,
          category: 'Algorithm',
        },
      ],
      datesDetected: [
        {
          dateString: 'Next Friday, October 24th at 2:00 PM',
          parsedDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          context: 'Midterm Exam covering Chapters 1 through 5 in Hall B',
          isExamOrDeadline: true,
        },
      ],
      entities: [
        { name: 'Dijkstra', category: 'Algorithm' },
        { name: 'A* Search', category: 'Algorithm' },
        { name: 'Bellman-Ford', category: 'Algorithm' },
        { name: 'Fibonacci Heap', category: 'Data Structure' },
      ],
      suggestedSubject: 'Computer Science',
      suggestedTags: ['Algorithms', 'Graphs', 'Shortest-Path', 'Midterm-Prep'],
      readingTimeMinutes: 2,
    };
  }

  async generateFlashcards(transcript: string, count: number = 5): Promise<FlashcardItem[]> {
    logger.info(`[LLM:Mock] Generating ${count} study flashcards...`);
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        cardId: 'fc-1',
        frontQuestion: 'What is the primary condition required for Dijkstra’s algorithm to yield correct shortest paths?',
        backAnswer: 'All edge weights in the graph must be non-negative (>= 0).',
        hint: 'Think about what happens if edges are negative.',
        difficulty: 'easy',
        topicTag: 'Graph Constraints',
      },
      {
        cardId: 'fc-2',
        frontQuestion: 'What is the time complexity of Dijkstra using a standard binary min-heap priority queue?',
        backAnswer: 'O((V + E) log V), where V is vertices and E is edges.',
        hint: 'Each vertex extraction and edge relaxation takes O(log V).',
        difficulty: 'medium',
        topicTag: 'Complexity Analysis',
      },
      {
        cardId: 'fc-3',
        frontQuestion: 'Which algorithm should be used instead of Dijkstra when graphs contain negative edge weights?',
        backAnswer: 'The Bellman-Ford algorithm (or Floyd-Warshall for all-pairs).',
        hint: 'Named after two pioneer computer scientists.',
        difficulty: 'easy',
        topicTag: 'Algorithm Selection',
      },
      {
        cardId: 'fc-4',
        frontQuestion: 'In A* search, what does it mean for a heuristic h(n) to be "admissible"?',
        backAnswer: 'An admissible heuristic never overestimates the true lowest cost from node n to the goal: h(n) <= h*(n).',
        hint: 'It must be optimistic.',
        difficulty: 'hard',
        topicTag: 'A* Search',
      },
      {
        cardId: 'fc-5',
        frontQuestion: 'How does a Fibonacci Heap improve Dijkstra’s asymptotic runtime?',
        backAnswer: 'It reduces the decrease-key operation to amortized O(1) time, yielding total runtime O(E + V log V).',
        hint: 'Focus on the cost of decrease-key.',
        difficulty: 'hard',
        topicTag: 'Data Structures',
      },
    ];
  }

  async generateQuiz(transcript: string, count: number = 5, difficulty: string = 'medium'): Promise<QuizQuestionItem[]> {
    logger.info(`[LLM:Mock] Generating ${count} MCQ quiz questions at ${difficulty} level...`);
    await new Promise(resolve => setTimeout(resolve, 600));

    return [
      {
        questionId: 'q-1',
        question: 'Why does Dijkstra’s algorithm fail in graphs with negative edge weights?',
        options: [
          'Because it cannot store negative values in memory',
          'Because greedy vertex finalization assumes distance can never decrease after extraction',
          'Because priority queues only support positive integers',
          'Because graph adjacency matrices cannot represent negative numbers',
        ],
        correctIndex: 1,
        explanation: 'Dijkstra permanently marks a vertex visited once extracted from the min-heap. A negative edge encountered later could provide a shorter path, invalidating this greedy choice.',
        difficulty: 'medium',
        topicTag: 'Algorithm Principles',
        bloomTaxonomyLevel: 'Understand',
      },
      {
        questionId: 'q-2',
        question: 'What is the optimal time complexity of Dijkstra when implemented with a Fibonacci heap on a dense graph where E ≈ V²?',
        options: ['O(V²)', 'O(V log V)', 'O(V³)', 'O(E log V)'],
        correctIndex: 0,
        explanation: 'With Fibonacci heap, time is O(E + V log V). When E = V², E dominates, yielding O(V²).',
        difficulty: 'hard',
        topicTag: 'Complexity Analysis',
        bloomTaxonomyLevel: 'Analyze',
      },
      {
        questionId: 'q-3',
        question: 'Which of the following describes the evaluation function f(n) in A* search?',
        options: [
          'f(n) = g(n) * h(n)',
          'f(n) = g(n) + h(n), where g(n) is past cost and h(n) is heuristic estimate',
          'f(n) = h(n) - g(n)',
          'f(n) = max(g(n), h(n))',
        ],
        correctIndex: 1,
        explanation: 'f(n) combines the known cost g(n) from start to node n with estimated cost h(n) from n to goal.',
        difficulty: 'easy',
        topicTag: 'A* Search',
        bloomTaxonomyLevel: 'Remember',
      },
      {
        questionId: 'q-4',
        question: 'If a heuristic function h(n) = 0 for all nodes, A* search behaves identically to which algorithm?',
        options: ['Depth First Search (DFS)', 'Dijkstra’s Algorithm', 'Bellman-Ford', 'Kruskal’s MST'],
        correctIndex: 1,
        explanation: 'When h(n) = 0, f(n) = g(n) + 0 = g(n), exactly minimizing distance from start like Dijkstra.',
        difficulty: 'medium',
        topicTag: 'Heuristics',
        bloomTaxonomyLevel: 'Apply',
      },
      {
        questionId: 'q-5',
        question: 'What is the primary advantage of the Bellman-Ford algorithm over Dijkstra’s algorithm?',
        options: [
          'Faster runtime on sparse graphs',
          'Capable of handling negative edge weights and detecting negative cycles',
          'Requires no priority queue or queue data structure',
          'Computes maximum spanning trees directly',
        ],
        correctIndex: 1,
        explanation: 'Bellman-Ford relaxes all edges |V|-1 times, handling negative weights and detecting reachable negative cycles.',
        difficulty: 'easy',
        topicTag: 'Algorithm Comparison',
        bloomTaxonomyLevel: 'Understand',
      },
    ];
  }
}

export function getLLMProvider(): ILLMProvider {
  // Can be extended with OpenAI / Gemini / Anthropic real API clients
  return new MockLLMProvider();
}
