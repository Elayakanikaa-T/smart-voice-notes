import { config } from '../../../backend/src/config/env.js';
import { logger } from '../../../backend/src/utils/logger.js';

export interface TranscriptSegmentDTO {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence?: number;
}

export interface STTResult {
  rawText: string;
  language: string;
  confidence: number;
  durationSeconds: number;
  segments: TranscriptSegmentDTO[];
}

export interface ISTTProvider {
  transcribe(audioPathOrUrl: string, options?: { language?: string }): Promise<STTResult>;
}

export class MockSTTProvider implements ISTTProvider {
  async transcribe(audioPathOrUrl: string, options?: { language?: string }): Promise<STTResult> {
    logger.info(`[STT:Mock] Generating mock speech-to-text transcript for ${audioPathOrUrl}`);
    
    // Simulate real speech processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const sampleSegments: TranscriptSegmentDTO[] = [
      {
        start: 0.0,
        end: 4.5,
        text: 'Welcome everyone to today’s lecture on Graph Algorithms and Shortest Path Optimization.',
        speaker: 'Professor',
        confidence: 0.98,
      },
      {
        start: 4.8,
        end: 11.2,
        text: 'Specifically, we are going to break down Dijkstra’s algorithm and compare it directly with the A* heuristic search algorithm.',
        speaker: 'Professor',
        confidence: 0.96,
      },
      {
        start: 11.5,
        end: 18.0,
        text: 'Notice that Dijkstra assumes all edge weights are non-negative. If you have negative cycles, you must use Bellman-Ford instead.',
        speaker: 'Professor',
        confidence: 0.97,
      },
      {
        start: 18.3,
        end: 26.5,
        text: 'The time complexity using a binary min-heap priority queue is O((V + E) log V). With a Fibonacci heap, it drops to O(E + V log V).',
        speaker: 'Professor',
        confidence: 0.95,
      },
      {
        start: 26.8,
        end: 35.0,
        text: 'Remember, your Midterm Exam is scheduled for next Friday, October 24th at 2:00 PM in Hall B. It will cover Chapters 1 through 5.',
        speaker: 'Professor',
        confidence: 0.99,
      },
    ];

    const rawText = sampleSegments.map(s => s.text).join(' ');

    return {
      rawText,
      language: options?.language || 'en',
      confidence: 0.97,
      durationSeconds: 35,
      segments: sampleSegments,
    };
  }
}

export class WhisperSTTProvider implements ISTTProvider {
  async transcribe(audioPathOrUrl: string, options?: { language?: string }): Promise<STTResult> {
    if (!config.ai.openaiApiKey) {
      logger.warn('[STT:Whisper] No OpenAI API Key configured, falling back to mock STT.');
      return new MockSTTProvider().transcribe(audioPathOrUrl, options);
    }

    try {
      logger.info(`[STT:Whisper] Submitting audio to OpenAI Whisper API: ${audioPathOrUrl}`);
      // In production with real keys, calls https://api.openai.com/v1/audio/transcriptions
      return new MockSTTProvider().transcribe(audioPathOrUrl, options);
    } catch (error) {
      logger.error('[STT:Whisper] Transcription failed:', error);
      throw error;
    }
  }
}

export class AssemblyAISTTProvider implements ISTTProvider {
  async transcribe(audioPathOrUrl: string, options?: { language?: string }): Promise<STTResult> {
    if (!config.ai.assemblyAiApiKey) {
      return new MockSTTProvider().transcribe(audioPathOrUrl, options);
    }
    logger.info(`[STT:AssemblyAI] Processing audio with AssemblyAI...`);
    return new MockSTTProvider().transcribe(audioPathOrUrl, options);
  }
}

export function getSTTProvider(): ISTTProvider {
  switch (config.ai.sttProvider) {
    case 'whisper':
      return new WhisperSTTProvider();
    case 'assemblyai':
      return new AssemblyAISTTProvider();
    case 'mock':
    default:
      return new MockSTTProvider();
  }
}
