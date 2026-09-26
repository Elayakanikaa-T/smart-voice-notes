import { config } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';
import fs from 'fs';
import path from 'path';
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
  transcribe(audioPathOrUrl: string, options?: { language?: string; title?: string }): Promise<STTResult>;
}

export function resolveAudioFilePath(audioPathOrUrl: string): string | null {
  if (!audioPathOrUrl) return null;
  if (path.isAbsolute(audioPathOrUrl) && fs.existsSync(audioPathOrUrl)) {
    return audioPathOrUrl;
  }

  const clean = audioPathOrUrl.replace(/^[\\/]+/, '');
  const candidates = [
    path.resolve(process.cwd(), clean),
    path.resolve(process.cwd(), 'uploads', clean),
    path.resolve(process.cwd(), 'uploads', 'meetings', clean),
    path.resolve(config.storage.localUploadDir, clean),
    path.resolve(config.storage.localUploadDir, path.basename(clean)),
    path.resolve(process.cwd(), 'uploads', path.basename(clean)),
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand)) {
      return cand;
    }
  }

  return null;
}

function getMimeTypeFromExt(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.webm': return 'audio/webm';
    case '.wav': return 'audio/wav';
    case '.mp3': return 'audio/mp3';
    case '.ogg': return 'audio/ogg';
    case '.flac': return 'audio/flac';
    case '.m4a':
    case '.mp4': return 'audio/mp4';
    default: return 'audio/webm';
  }
}

/**
 * Helper: sleep for given ms (used for retry backoff)
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * MockSTTProvider — returns an EMPTY result (no fake text).
 * This is only used as an absolute last resort when no real API is available.
 */
export class MockSTTProvider implements ISTTProvider {
  async transcribe(audioPathOrUrl: string, options?: { language?: string; title?: string }): Promise<STTResult> {
    logger.warn(`[STT:Mock] No real STT API available. Returning empty transcript for: ${audioPathOrUrl}`);
    return {
      rawText: '',
      language: options?.language || 'en',
      confidence: 0,
      durationSeconds: 0,
      segments: [],
    };
  }
}

export class GeminiSTTProvider implements ISTTProvider {
  private apiKey: string;
  private maxRetries = 3;

  constructor() {
    this.apiKey = config.ai.geminiApiKey;
  }

  async transcribe(audioPathOrUrl: string, options?: { language?: string; title?: string }): Promise<STTResult> {
    if (!this.apiKey) {
      logger.warn('[STT:Gemini] GEMINI_API_KEY is not set. Cannot transcribe.');
      throw new Error('GEMINI_API_KEY is not configured. Audio transcription unavailable.');
    }

    const resolved = resolveAudioFilePath(audioPathOrUrl);
    if (!resolved || !fs.existsSync(resolved)) {
      logger.warn(`[STT:Gemini] Local audio file not found at ${audioPathOrUrl}`);
      throw new Error(`Audio file not found: ${audioPathOrUrl}`);
    }

    logger.info(`[STT:Gemini] Transcribing audio with Gemini 1.5 Flash: ${resolved}`);
    const audioBuffer = fs.readFileSync(resolved);
    const base64Audio = audioBuffer.toString('base64');
    const mimeType = getMimeTypeFromExt(resolved);

    const prompt = `You are a professional speech-to-text transcription engine. Transcribe the following spoken audio completely and accurately.
Output JSON strictly conforming to this schema:
{
  "rawText": "Full word-for-word transcript of the spoken speech",
  "language": "${options?.language || 'en'}",
  "confidence": 0.98,
  "durationSeconds": 30,
  "segments": [
    {
      "start": 0.0,
      "end": 5.0,
      "text": "Sentence or phrase transcript",
      "speaker": "Speaker 1"
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const body = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    // Retry with exponential backoff for transient errors (503 overload, 429 rate limit)
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.status === 503 || res.status === 429) {
          const errText = await res.text();
          lastError = new Error(`Gemini API overloaded (${res.status}): ${errText}`);
          logger.warn(`[STT:Gemini] Attempt ${attempt}/${this.maxRetries} failed with ${res.status}. Retrying...`);
          await sleep(Math.pow(2, attempt) * 1000); // 2s, 4s, 8s
          continue;
        }

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini STT API error (${res.status}): ${errText}`);
        }

        const data: any = await res.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        let rawText = '';
        let segments: TranscriptSegmentDTO[] = [];
        let parsedLanguage = options?.language || 'en';
        let parsedDuration = 30;

        try {
          const cleaned = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
          const parsed = JSON.parse(cleaned);
          rawText = parsed.rawText || parsed.transcript || parsed.text || '';
          parsedLanguage = parsed.language || options?.language || 'en';
          parsedDuration = Number(parsed.durationSeconds) || 30;
          if (Array.isArray(parsed.segments)) {
            segments = parsed.segments.map((s: any) => ({
              start: Number(s.start) || 0,
              end: Number(s.end) || 0,
              text: s.text || '',
              speaker: s.speaker || 'Speaker 1',
              confidence: Number(s.confidence) || 0.98,
            }));
          }
        } catch {
          rawText = content.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
        }

        if (!rawText.trim()) {
          rawText = content.trim() || '';
        }

        return {
          rawText: rawText.trim(),
          language: parsedLanguage,
          confidence: 0.98,
          durationSeconds: parsedDuration,
          segments: segments.length > 0 ? segments : rawText.trim() ? [{
            start: 0,
            end: parsedDuration,
            text: rawText.trim(),
            speaker: 'Speaker 1',
            confidence: 0.98,
          }] : [],
        };
      } catch (err: any) {
        lastError = err;
        if (attempt < this.maxRetries) {
          logger.warn(`[STT:Gemini] Attempt ${attempt}/${this.maxRetries} failed: ${err.message}. Retrying...`);
          await sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries exhausted — throw error, do NOT fall back to mock/fake text
    logger.error(`[STT:Gemini] All ${this.maxRetries} attempts failed: ${lastError?.message}`);
    throw lastError || new Error('Gemini STT transcription failed after all retries.');
  }
}

export class WhisperSTTProvider implements ISTTProvider {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.ai.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: config.ai.openaiApiKey });
    }
  }

  async transcribe(audioPathOrUrl: string, options?: { language?: string; title?: string }): Promise<STTResult> {
    if (!this.openai) {
      logger.warn('[STT:Whisper] OPENAI_API_KEY not provided, checking Gemini fallback.');
      if (config.ai.geminiApiKey) {
        return new GeminiSTTProvider().transcribe(audioPathOrUrl, options);
      }
      throw new Error('No STT API key configured (neither OpenAI nor Gemini).');
    }

    const resolved = resolveAudioFilePath(audioPathOrUrl);
    if (!resolved || !fs.existsSync(resolved)) {
      logger.error(`[STT:Whisper] Audio file not found at path: ${audioPathOrUrl}`);
      throw new Error(`Audio file not found: ${audioPathOrUrl}`);
    }

    try {
      logger.info(`[STT:Whisper] Transcribing audio with OpenAI Whisper from ${resolved}...`);
      const fileStream = fs.createReadStream(resolved);
      const response = await this.openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        language: options?.language ? options.language.split('-')[0] : undefined,
        response_format: 'verbose_json',
      });

      const raw = response as any;
      const segments: TranscriptSegmentDTO[] = (raw.segments || []).map((s: any) => ({
        start: s.start,
        end: s.end,
        text: s.text,
        speaker: 'Speaker 1',
        confidence: s.no_speech_prob ? 1 - s.no_speech_prob : 0.95,
      }));

      return {
        rawText: response.text,
        language: raw.language || options?.language || 'en',
        confidence: 0.95,
        durationSeconds: raw.duration || 0,
        segments: segments.length ? segments : [{
          start: 0,
          end: raw.duration || 0,
          text: response.text,
          speaker: 'Speaker 1',
          confidence: 0.95,
        }],
      };
    } catch (err: any) {
      logger.error(`[STT:Whisper] Whisper error: ${err.message}`);
      if (config.ai.geminiApiKey) {
        return new GeminiSTTProvider().transcribe(audioPathOrUrl, options);
      }
      throw err;
    }
  }
}

export class HybridSTTProvider implements ISTTProvider {
  async transcribe(audioPathOrUrl: string, options?: { language?: string; title?: string }): Promise<STTResult> {
    if (config.ai.geminiApiKey) {
      return new GeminiSTTProvider().transcribe(audioPathOrUrl, options);
    }
    if (config.ai.openaiApiKey) {
      return new WhisperSTTProvider().transcribe(audioPathOrUrl, options);
    }
    logger.warn('[STT:Hybrid] No API keys configured. Returning empty transcript.');
    return new MockSTTProvider().transcribe(audioPathOrUrl, options);
  }
}

export function getSTTProvider(): ISTTProvider {
  switch (config.ai.sttProvider) {
    case 'whisper':
      return new WhisperSTTProvider();
    case 'google':
    case 'gemini' as any:
      return new GeminiSTTProvider();
    case 'mock':
      return new MockSTTProvider();
    default:
      return new HybridSTTProvider();
  }
}

