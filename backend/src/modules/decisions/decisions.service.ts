import { DecisionModel } from '../../models/decision.model.js';
import { MeetingModel } from '../../models/meeting.model.js';

export class DecisionsService {
  private async checkAccess(meetingId: string, userId: string, role: string) {
    const meeting = await MeetingModel.findById(meetingId).lean();
    if (!meeting) throw new Error('Meeting not found.');
    if (role === 'admin') return meeting;
    const isOrg = (meeting as any).organizer === userId;
    const isPart = (meeting as any).participants?.some((p: any) => p.userId === userId);
    if (!isOrg && !isPart && role !== 'employee') throw new Error('Access denied.');
    return meeting;
  }

  async list(meetingId: string, userId: string, role: string) {
    await this.checkAccess(meetingId, userId, role);
    return DecisionModel.find({ meetingId }).sort({ created_at: 1 }).lean();
  }

  async create(meetingId: string, text: string, userId: string, role: string) {
    await this.checkAccess(meetingId, userId, role);
    const decision = await DecisionModel.create({ meetingId, text });
    return decision.toObject();
  }

  async update(meetingId: string, decisionId: string, text: string, userId: string, role: string) {
    await this.checkAccess(meetingId, userId, role);
    const d = await DecisionModel.findByIdAndUpdate(
      decisionId,
      { $set: { text } },
      { new: true }
    ).lean();
    if (!d) throw new Error('Decision not found.');
    return d;
  }

  async remove(meetingId: string, decisionId: string, userId: string, role: string) {
    await this.checkAccess(meetingId, userId, role);
    await DecisionModel.findByIdAndDelete(decisionId);
    return { success: true };
  }
}

export const decisionsService = new DecisionsService();
