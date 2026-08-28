import { MeetingSummaryModel } from '../../models/meetingSummary.model.js';
import { MeetingTranscriptModel } from '../../models/meetingTranscript.model.js';
import { MeetingModel } from '../../models/meeting.model.js';
import { meetingQueue } from '../../services/meetingQueue.js';

export class SummariesService {
  async get(meetingId: string, userId: string, role: string) {
    const meeting = await MeetingModel.findById(meetingId).lean();
    if (!meeting) throw new Error('Meeting not found.');
    if (role !== 'admin') {
      const isOrg = (meeting as any).organizer === userId;
      const isPart = (meeting as any).participants?.some((p: any) => p.userId === userId);
      if (!isOrg && !isPart && role !== 'employee') throw new Error('Access denied.');
    }
    const summary = await MeetingSummaryModel.findOne({ meetingId }).lean();
    return summary;
  }

  async regenerate(meetingId: string, userId: string, role: string) {
    const meeting = await MeetingModel.findById(meetingId).lean();
    if (!meeting) throw new Error('Meeting not found.');
    if (role !== 'admin' && (meeting as any).organizer !== userId) {
      throw new Error('Only the organizer or admin can regenerate the summary.');
    }

    const transcript = await MeetingTranscriptModel.findOne({ meetingId, status: 'done' }).lean();
    if (!transcript || !(transcript as any).fullText) {
      throw new Error('Transcript not ready. Cannot regenerate summary.');
    }

    await MeetingSummaryModel.findOneAndUpdate(
      { meetingId },
      { $set: { status: 'pending', shortSummary: '', detailedNotes: '', keyPoints: [] } },
      { upsert: true }
    );

    await meetingQueue.add('generate-summary', {
      meetingId,
      transcriptText: (transcript as any).fullText,
    });

    return { queued: true, message: 'Summary regeneration started.' };
  }
}

export const summariesService = new SummariesService();
