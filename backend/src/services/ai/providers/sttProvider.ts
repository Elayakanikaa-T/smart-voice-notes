import { config } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';
import fs from 'fs';
import OpenAI from 'openai';


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
    await new Promise(resolve => setTimeout(resolve, 300));

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
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: config.ai.openaiApiKey });
  }

  async transcribe(audioPathOrUrl: string, options?: { language?: string }): Promise<STTResult> {
    logger.info(`[STT:Whisper] Transcribing audio with OpenAI Whisper...`);
    
    // We expect audioPathOrUrl to be a local file path since our local mock storage saves it to disk
    // If it's a URL (e.g. S3), we'd need to download it first. For this project, local fallback is the default.
    let fileStream;
    try {
      fileStream = fs.createReadStream(audioPathOrUrl);
    } catch (err) {
      logger.error(`[STT:Whisper] Could not read audio file: ${audioPathOrUrl}`);
      throw new Error(`Audio file not found: ${audioPathOrUrl}`);
    }

    const response = await this.openai.audio.translations.create({
      file: fileStream,
      model: 'whisper-1',
      response_format: 'verbose_json',
    });

    const raw = response as any;

    const segments = raw.segments?.map((s: any) => ({
      start: s.start,
      end: s.end,
      text: s.text,
      speaker: 'Speaker 1',
      confidence: s.no_speech_prob ? 1 - s.no_speech_prob : 0.95,
    })) || [];

    return {
      rawText: response.text,
      language: raw.language || options?.language || 'en',
      confidence: 0.95,
      durationSeconds: raw.duration || 0,
      segments: segments.length ? segments : [{
        start: 0,
        end: raw.duration || 0,
        text: response.text,
        confidence: 0.95,
      }],
    };
  }
}

export function getSTTProvider(): ISTTProvider {
  switch (config.ai.sttProvider) {
    case 'whisper':
      return new WhisperSTTProvider();
    case 'mock':
    default:
      return new MockSTTProvider();
  }
}
