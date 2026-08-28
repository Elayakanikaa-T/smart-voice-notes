import { MeetingModel } from '../../models/meeting.model.js';
import { MeetingTranscriptModel } from '../../models/meetingTranscript.model.js';
import { MeetingSummaryModel } from '../../models/meetingSummary.model.js';
import { DecisionModel } from '../../models/decision.model.js';
import { ActionItemModel } from '../../models/actionItem.model.js';

export class SearchService {
  async search(params: {
    q?: string;
    from?: string;
    to?: string;
    title?: string;
    participant?: string;
    userId: string;
    role: string;
    page?: number;
    limit?: number;
  }) {
    const { q, from, to, title, participant, userId, role, page = 1, limit = 20 } = params;

    // Base meeting query — scope to accessible meetings
    const meetingQuery: any = {};
    if (role !== 'admin') {
      meetingQuery.$or = [
        { organizer: userId },
        { 'participants.userId': userId },
      ];
    }

    if (title) meetingQuery.title = { $regex: title, $options: 'i' };
    if (participant) {
      meetingQuery['participants.email'] = { $regex: participant, $options: 'i' };
    }
    if (from || to) {
      meetingQuery.created_at = {};
      if (from) meetingQuery.created_at.$gte = new Date(from);
      if (to) meetingQuery.created_at.$lte = new Date(to);
    }

    // Fetch matching meeting IDs
    let meetingIds: string[] = [];
    if (q) {
      // Text search across all meeting-related collections
      const [meetings, transcripts, summaries, decisions, actionItems] = await Promise.all([
        MeetingModel.find({
          ...meetingQuery,
          $text: { $search: q },
        }, { _id: 1 }).lean(),
        MeetingTranscriptModel.find({ $text: { $search: q } }, { meetingId: 1 }).lean(),
        MeetingSummaryModel.find({ $text: { $search: q } }, { meetingId: 1 }).lean(),
        DecisionModel.find({ $text: { $search: q } }, { meetingId: 1 }).lean(),
        ActionItemModel.find({ $text: { $search: q } }, { meetingId: 1 }).lean(),
      ]);

      const idsSet = new Set<string>([
        ...meetings.map((m: any) => m._id),
        ...transcripts.map((t: any) => t.meetingId),
        ...summaries.map((s: any) => s.meetingId),
        ...decisions.map((d: any) => d.meetingId),
        ...actionItems.map((a: any) => a.meetingId),
      ]);

      meetingIds = Array.from(idsSet);
    }

    // Final meeting filter
    const finalQuery: any = { ...meetingQuery };
    if (q && meetingIds.length > 0) {
      finalQuery._id = { $in: meetingIds };
      delete finalQuery.$text;
    } else if (q && meetingIds.length === 0) {
      return { meetings: [], total: 0, page, limit, pages: 0 };
    }

    const total = await MeetingModel.countDocuments(finalQuery);
    const results = await MeetingModel.find(finalQuery)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { meetings: results, total, page, limit, pages: Math.ceil(total / limit) };
  }
}

export const searchService = new SearchService();
