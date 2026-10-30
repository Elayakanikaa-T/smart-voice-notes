import { DoubtChatSessionModel, IDoubtChatSession } from '../../models/index.js';
import { getLLMProvider } from '../../services/ai/index.js';
import { isMongoConnected } from '../../config/database.js';

const inMemorySessions = new Map<string, any>();

class DoubtChatService {
  async getSession(userId: string, subjectId?: string): Promise<any> {
    const key = `${userId}_${subjectId || 'general'}`;
    if (!isMongoConnected) {
      return inMemorySessions.get(key) || { user_id: userId, messages: [] };
    }
    
    const query: any = { user_id: userId };
    if (subjectId) {
      query.subject_id = subjectId;
    }
    
    const doc = await DoubtChatSessionModel.findOne(query).sort({ updated_at: -1 });
    return doc || inMemorySessions.get(key) || null;
  }

  async processMessage(userId: string, content: string, subjectId?: string, context?: string): Promise<any> {
    const key = `${userId}_${subjectId || 'general'}`;
    const userMsg = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    let session: any = null;

    if (isMongoConnected) {
      try {
        const query: any = { user_id: userId };
        if (subjectId) {
          query.subject_id = subjectId;
        }
        session = await DoubtChatSessionModel.findOne(query).sort({ updated_at: -1 });
        if (!session) {
          session = new DoubtChatSessionModel({
            user_id: userId,
            subject_id: subjectId,
            messages: [],
          });
        }
      } catch {
        session = null;
      }
    }

    if (!session) {
      session = inMemorySessions.get(key) || {
        user_id: userId,
        subject_id: subjectId,
        messages: [],
        save: async () => {},
      };
    }

    // 2. Add user message
    session.messages.push(userMsg);

    // 3. Call AI Provider
    const llm = getLLMProvider();
    
    // Pass the last 10 messages for context
    const recentMessages = session.messages.slice(-10);
    const aiResponse = await (llm.answerDoubt ? llm.answerDoubt(recentMessages, context) : 'Here is your answer.');

    // 4. Add AI response
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    if (isMongoConnected && typeof session.save === 'function') {
      try {
        await session.save();
      } catch {}
    }
    inMemorySessions.set(key, session);

    return session;
  }

  async clearSession(userId: string, subjectId?: string): Promise<void> {
    const key = `${userId}_${subjectId || 'general'}`;
    inMemorySessions.delete(key);
    if (isMongoConnected) {
      try {
        const query: any = { user_id: userId };
        if (subjectId) query.subject_id = subjectId;
        await DoubtChatSessionModel.deleteMany(query);
      } catch {}
    }
  }
}

export const doubtChatService = new DoubtChatService();
