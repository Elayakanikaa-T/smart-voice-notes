import { DoubtChatSessionModel, IDoubtChatSession } from '../../models/index.js';
import { getLLMProvider } from '../../services/ai/index.js';
import { isMongoConnected } from '../../config/database.js';

class DoubtChatService {
  async getSession(userId: string, subjectId?: string): Promise<IDoubtChatSession | null> {
    if (!isMongoConnected) return null; // Mock mode unsupported for persistent chat sessions for now
    
    const query: any = { user_id: userId };
    if (subjectId) {
      query.subject_id = subjectId;
    }
    
    return DoubtChatSessionModel.findOne(query).sort({ updated_at: -1 });
  }

  async processMessage(userId: string, content: string, subjectId?: string, context?: string): Promise<IDoubtChatSession> {
    if (!isMongoConnected) throw new Error('MongoDB must be connected to use Doubt Chat.');
    
    // 1. Find or create session
    const query: any = { user_id: userId };
    if (subjectId) {
      query.subject_id = subjectId;
    }
    let session = await DoubtChatSessionModel.findOne(query).sort({ updated_at: -1 });
    if (!session) {
      session = new DoubtChatSessionModel({
        user_id: userId,
        subject_id: subjectId,
        messages: [],
      });
    }

    // 2. Add user message
    session.messages.push({
      role: 'user',
      content,
      timestamp: new Date(),
    });

    // 3. Call AI Provider
    const llm = getLLMProvider();
    
    // Pass the last 10 messages for context
    const recentMessages = session.messages.slice(-10);
    const aiResponse = await llm.answerDoubt!(recentMessages, context);

    // 4. Add AI response
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    await session.save();
    return session;
  }
}

export const doubtChatService = new DoubtChatService();
