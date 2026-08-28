import { config } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';
import {
  ILLMProvider,
  AISummaryResult,
  FlashcardItem,
  QuizQuestionItem,
  TopicDetailResult
} from './llmProvider.js';

export class GeminiLLMProvider implements ILLMProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = config.ai.geminiApiKey;
    if (!this.apiKey) {
      logger.warn('[LLM:Gemini] Warning: GEMINI_API_KEY is not set. Provider calls may fail.');
    }
  }

  private async callGemini(prompt: string, expectJson = true): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const body: any = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (expectJson) {
      body.generationConfig = { responseMimeType: 'application/json' };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async generateSummary(transcript: string, title?: string): Promise<AISummaryResult> {
    logger.info(`[LLM:Gemini] Generating structured summary for note: "${title || 'Untitled'}"...`);
    const prompt = `You are an expert AI study companion. Analyze this lecture/study voice transcript:
    Title: "${title || 'Lecture Note'}"
    Transcript:
    "${transcript}"

    Generate a complete educational study summary strictly in JSON format matching this schema:
    {
      "summaryText": "3-5 paragraph comprehensive structured overview in markdown",
      "bulletPoints": ["High yield bullet 1", "High yield bullet 2", "High yield bullet 3"],
      "keyTakeaways": ["Core concept 1", "Core concept 2"],
      "keywords": [{ "term": "Term Name", "definition": "Clear concise definition", "importance": 4, "category": "Concept" }],
      "datesDetected": [{ "dateString": "e.g. Next Monday", "context": "Exam deadline context", "isExamOrDeadline": true }],
      "entities": [{ "name": "e.g. Dijkstra", "category": "Person/Concept" }],
      "suggestedSubject": "Recommended subject name",
      "suggestedTags": ["Tag1", "Tag2"],
      "readingTimeMinutes": 3,
      "actionItems": [{ "task": "Task description", "is_completed": false }],
      "presentationOutline": [{ "slide_number": 1, "title": "Slide Title", "bullet_points": ["Point A", "Point B"] }]
    }`;

    try {
      const text = await this.callGemini(prompt, true);
      return JSON.parse(text) as AISummaryResult;
    } catch (error) {
      logger.error('[LLM:Gemini] Error generating summary, falling back to basic format:', error);
      return {
        summaryText: transcript.slice(0, 500) + '...',
        bulletPoints: ['Note uploaded and transcribed successfully.'],
        keyTakeaways: ['Review note transcript for exam preparation.'],
        keywords: [{ term: 'Study Note', definition: 'Transcript captured via voice recording', importance: 3, category: 'General' }],
        datesDetected: [],
        entities: [],
        suggestedSubject: 'General Studies',
        suggestedTags: ['VoiceNote', 'Study'],
        readingTimeMinutes: Math.max(1, Math.round(transcript.split(' ').length / 200)),
        actionItems: [],
        presentationOutline: [{ slide_number: 1, title: title || 'Overview', bullet_points: ['Summary generation in progress'] }],
      };
    }
  }

  async generateFlashcards(transcript: string, count = 5): Promise<FlashcardItem[]> {
    logger.info(`[LLM:Gemini] Generating ${count} flashcards...`);
    const prompt = `Generate ${count} high-yield study flashcards from this transcript:
    "${transcript}"

    Output JSON strictly matching:
    {
      "flashcards": [
        {
          "cardId": "uuid or 1",
          "frontQuestion": "Clear prompt/question",
          "backAnswer": "Concise, definitive answer",
          "hint": "Optional hint",
          "difficulty": "easy" | "medium" | "hard",
          "topicTag": "Specific topic"
        }
      ]
    }`;

    try {
      const text = await this.callGemini(prompt, true);
      const data = JSON.parse(text);
      return data.flashcards || [];
    } catch (err) {
      logger.error('[LLM:Gemini] Flashcards generation error:', err);
      return [];
    }
  }

  async generateQuiz(transcript: string, count = 5, difficulty = 'medium'): Promise<QuizQuestionItem[]> {
    logger.info(`[LLM:Gemini] Generating ${count} quiz questions (${difficulty})...`);
    const prompt = `Generate ${count} multiple-choice quiz questions (${difficulty} difficulty) from this content:
    "${transcript}"

    Output strictly as JSON:
    {
      "questions": [
        {
          "questionId": "1",
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 0,
          "explanation": "Why this answer is correct",
          "difficulty": "${difficulty}",
          "topicTag": "Topic Name",
          "bloomTaxonomyLevel": "Understand"
        }
      ]
    }`;

    try {
      const text = await this.callGemini(prompt, true);
      const data = JSON.parse(text);
      return data.questions || [];
    } catch (err) {
      logger.error('[LLM:Gemini] Quiz generation error:', err);
      return [];
    }
  }

  async generateTopicDetails(topic: string, context?: string): Promise<TopicDetailResult> {
    logger.info(`[LLM:Gemini] Generating topic breakdown for: "${topic}"...`);
    const prompt = `Perform an in-depth educational breakdown of: "${topic}".
    Context: "${context || ''}".

    Output strictly as JSON matching:
    {
      "topic": "${topic}",
      "category": "string",
      "summary": "string",
      "details": "string",
      "keyPoints": ["string"],
      "examTips": ["string"],
      "practicalApplications": ["string"],
      "flashcard": { "question": "string", "answer": "string" },
      "quizQuestion": { "question": "string", "options": ["string", "string", "string", "string"], "correctIndex": 0, "explanation": "string" },
      "relatedTopics": ["string"]
    }`;

    try {
      const text = await this.callGemini(prompt, true);
      return JSON.parse(text) as TopicDetailResult;
    } catch (err) {
      logger.error('[LLM:Gemini] Topic details error:', err);
      throw err;
    }
  }

  async translateContent(text: string, targetLanguage: string, sourceLanguage = 'en'): Promise<string> {
    logger.info(`[LLM:Gemini] Translating content to ${targetLanguage}...`);
    const prompt = `Translate the following educational text from ${sourceLanguage} to ${targetLanguage}. Maintain academic terminology accurately. Output only the translated text, no preamble or extra comments.
    
    Text:
    """
    ${text}
    """`;

    try {
      return await this.callGemini(prompt, false);
    } catch (err) {
      logger.error('[LLM:Gemini] Translation error:', err);
      return text;
    }
  }

  async answerDoubt(messages: any[], context?: string): Promise<string> {
    logger.info(`[LLM:Gemini] Answering doubt...`);
    const formattedMessages = (messages || []).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const prompt = `You are a helpful AI study assistant. Answer the student's doubt.
    Important constraint: Do NOT use any special characters, markdown hashes, asterisks, LaTeX equations, emojis, or table symbols. Output only clean, plain text with simple numbers or hyphens and clear line breaks.
    Context from their study material (if any):
    "${context || 'None'}"

    Conversation history:
    ${formattedMessages}
    
    ASSISTANT:`;

    try {
      return await this.callGemini(prompt, false);
    } catch (err) {
      logger.error('[LLM:Gemini] Doubt chat error:', err);
      throw err;
    }
  }
}
