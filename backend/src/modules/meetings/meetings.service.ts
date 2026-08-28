import { MeetingModel, IMeeting } from '../../models/meeting.model.js';
import { MeetingTranscriptModel } from '../../models/meetingTranscript.model.js';
import { MeetingSummaryModel } from '../../models/meetingSummary.model.js';
import { DecisionModel } from '../../models/decision.model.js';
import { ActionItemModel } from '../../models/actionItem.model.js';
import { NotificationModel } from '../../models/meetingNotification.model.js';
import { UserModel } from '../../models/user.model.js';
import { meetingQueue } from '../../services/meetingQueue.js';
import { logger } from '../../utils/logger.js';

export class MeetingsService {
  async create(data: {
    title: string;
    organizerId: string;
    participants?: { name: string; email: string; userId?: string }[];
    scheduledAt?: string;
  }) {
    const meeting = await MeetingModel.create({
      title: data.title,
      organizer: data.organizerId,
      participants: data.participants || [],
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      status: 'scheduled',
    });

    // Automatically send in-app notifications and invite link to organizer and participants
    try {
      const organizerUser = await UserModel.findById(data.organizerId).lean();
      const usersToNotify = new Set<string>();
      usersToNotify.add(data.organizerId);

      // Find user IDs for any participants by email if available
      if (data.participants && data.participants.length > 0) {
        const emails = data.participants.map(p => p.email.toLowerCase());
        const foundUsers = await UserModel.find({ email: { $in: emails } }).select('_id').lean();
        foundUsers.forEach((u: any) => usersToNotify.add(u._id));
      }

      // Create notification for each user
      const notifs = Array.from(usersToNotify).map(uid => ({
        userId: uid,
        type: 'general',
        title: `New Meeting Fixed: ${data.title}`,
        message: `Meeting "${data.title}" has been scheduled. Join live at /meetings/live/${meeting._id} or open workspace.`,
        relatedMeetingId: meeting._id,
      }));

      await NotificationModel.insertMany(notifs);
      logger.info(`[MeetingsService] Sent meeting fixed notification to ${notifs.length} user(s) for meeting ${meeting._id}`);

      // Create initial assigned action items so "Total Assigned" updates immediately
      const initialItems: any[] = [];
      const defaultDueDate = data.scheduledAt ? new Date(data.scheduledAt) : new Date(Date.now() + 86400000 * 2);

      // Assign task to organizer
      initialItems.push({
        meetingId: meeting._id,
        task: `Host & Facilitate Meeting: ${data.title}`,
        owner: {
          userId: data.organizerId,
          name: (organizerUser as any)?.name || 'Organizer',
          email: (organizerUser as any)?.email || 'organizer@company.com',
        },
        dueDate: defaultDueDate,
        status: 'open',
        progress: 0,
      });

      // Assign tasks to all participants
      if (data.participants && data.participants.length > 0) {
        data.participants.forEach(p => {
          initialItems.push({
            meetingId: meeting._id,
            task: `Attend & Review: ${data.title}`,
            owner: {
              userId: p.userId,
              name: p.name || p.email.split('@')[0],
              email: p.email,
            },
            dueDate: defaultDueDate,
            status: 'open',
            progress: 0,
          });
        });
      }

      if (initialItems.length > 0) {
        await ActionItemModel.insertMany(initialItems);
        logger.info(`[MeetingsService] Created ${initialItems.length} assigned action items for meeting ${meeting._id}`);
      }
    } catch (err: any) {
      logger.warn(`[MeetingsService] Could not send initial meeting notifications or action items: ${err.message}`);
    }

    const meetingObj = meeting.toObject();
    return {
      ...meetingObj,
      liveLink: `/meetings/live/${meeting._id}`,
      workspaceLink: `/meetings/${meeting._id}`,
    };
  }

  async list(filters: {
    userId: string;
    role: string;
    page?: number;
    limit?: number;
    status?: string;
    from?: string;
    to?: string;
  }) {
    const { userId, role, page = 1, limit = 20, status, from, to } = filters;
    const query: any = {};

    if (role !== 'admin') {
      query.$or = [
        { organizer: userId },
        { 'participants.userId': userId },
      ];
    }

    if (status) query.status = status;
    if (from || to) {
      query.created_at = {};
      if (from) query.created_at.$gte = new Date(from);
      if (to) query.created_at.$lte = new Date(to);
    }

    const total = await MeetingModel.countDocuments(query);
    const meetings = await MeetingModel.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { meetings, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getById(meetingId: string, userId: string, role: string) {
    const meeting = await MeetingModel.findById(meetingId).lean();
    if (!meeting) throw new Error('Meeting not found.');

    // Access check: admin can see all, others only if organizer or participant
    if (role !== 'admin') {
      const m = meeting as any;
      const isOrganizer = m.organizer === userId;
      const isParticipant = m.participants?.some(
        (p: any) => p.userId === userId
      );
      if (!isOrganizer && !isParticipant && role !== 'employee') {
        throw new Error('Access denied.');
      }
    }

    const [transcript, summary, decisions, actionItems] = await Promise.all([
      MeetingTranscriptModel.findOne({ meetingId }).lean(),
      MeetingSummaryModel.findOne({ meetingId }).lean(),
      DecisionModel.find({ meetingId }).sort({ created_at: 1 }).lean(),
      ActionItemModel.find({ meetingId }).sort({ created_at: 1 }).lean(),
    ]);

    return { meeting, transcript, summary, decisions, actionItems };
  }

  async update(meetingId: string, data: Partial<IMeeting>, userId: string, role: string) {
    const meeting = await MeetingModel.findById(meetingId);
    if (!meeting) throw new Error('Meeting not found.');
    if (role !== 'admin' && meeting.organizer !== userId) {
      throw new Error('Only the organizer can edit this meeting.');
    }

    const allowed: any = {};
    if (data.title) allowed.title = data.title;
    if (data.participants !== undefined) allowed.participants = data.participants;
    if (data.scheduledAt !== undefined) allowed.scheduledAt = data.scheduledAt;

    const updated = await MeetingModel.findByIdAndUpdate(
      meetingId,
      { $set: allowed },
      { new: true }
    ).lean();
    return updated;
  }

  async deleteMeeting(meetingId: string, userId: string, role: string) {
    const meeting = await MeetingModel.findById(meetingId);
    if (!meeting) throw new Error('Meeting not found.');
    if (role !== 'admin' && meeting.organizer !== userId) {
      throw new Error('Only an admin or the organizer can delete this meeting.');
    }

    await Promise.all([
      MeetingModel.findByIdAndDelete(meetingId),
      MeetingTranscriptModel.deleteMany({ meetingId }),
      MeetingSummaryModel.deleteMany({ meetingId }),
      DecisionModel.deleteMany({ meetingId }),
      ActionItemModel.deleteMany({ meetingId }),
    ]);
    return { success: true };
  }

  async uploadAudio(
    meetingId: string,
    audioUrl: string,
    userId: string,
    role: string,
    exactTranscriptText?: string,
    exactSegments?: any[]
  ) {
    const meeting = await MeetingModel.findById(meetingId);
    if (!meeting) throw new Error('Meeting not found.');
    if (role !== 'admin' && meeting.organizer !== userId) {
      throw new Error('Only the organizer can upload audio.');
    }

    const status = exactTranscriptText && exactTranscriptText.trim() ? 'done' : 'processing';
    await MeetingModel.findByIdAndUpdate(meetingId, {
      $set: { audioUrl, status },
    });

    // Save speech-to-text transcript immediately
    await MeetingTranscriptModel.findOneAndUpdate(
      { meetingId },
      {
        $set: {
          meetingId,
          status: 'done',
          fullText: exactTranscriptText || '',
          segments: exactSegments || (exactTranscriptText ? [{ speaker: 'Speaker', start: 0, end: 0, text: exactTranscriptText }] : []),
        },
      },
      { upsert: true }
    );

    // If no transcript provided from client, enqueue worker to transcribe
    if (!exactTranscriptText || !exactTranscriptText.trim()) {
      await meetingQueue.add('process-meeting', {
        meetingId,
        audioUrl,
      });
    }

    return { queued: true, message: 'Audio and speech-to-text transcript saved successfully.' };
  }

  async getStatus(meetingId: string) {
    const [meeting, transcript, summary] = await Promise.all([
      MeetingModel.findById(meetingId, 'status title').lean(),
      MeetingTranscriptModel.findOne({ meetingId }, 'status errorMessage').lean(),
      MeetingSummaryModel.findOne({ meetingId }, 'status errorMessage').lean(),
    ]);

    if (!meeting) throw new Error('Meeting not found.');
    return {
      meetingId,
      meetingStatus: (meeting as any).status,
      transcription: transcript
        ? { status: (transcript as any).status, error: (transcript as any).errorMessage }
        : null,
      summary: summary
        ? { status: (summary as any).status, error: (summary as any).errorMessage }
        : null,
    };
  }

  async shareMeeting(meetingId: string, customMessage?: string, senderUserId?: string) {
    const meeting = await MeetingModel.findById(meetingId).lean();
    if (!meeting) throw new Error('Meeting not found.');

    const usersToNotify = new Set<string>();
    if (senderUserId) usersToNotify.add(senderUserId);
    if ((meeting as any).organizer) usersToNotify.add((meeting as any).organizer);

    // Add participant user IDs or look up by participant emails
    if ((meeting as any).participants && (meeting as any).participants.length > 0) {
      const emails = (meeting as any).participants.map((p: any) => p.email?.toLowerCase()).filter(Boolean);
      const foundUsers = await UserModel.find({ email: { $in: emails } }).select('_id').lean();
      foundUsers.forEach((u: any) => usersToNotify.add(u._id));
    }

    // Also notify all employees so they can join/collaborate
    const allEmployees = await UserModel.find({ role: { $in: ['employee', 'admin'] } }).select('_id').lean();
    allEmployees.forEach((u: any) => usersToNotify.add(u._id));

    const defaultMsg = `Meeting "${(meeting as any).title}" is ready. Join live or view the meeting workspace.`;
    const message = customMessage || defaultMsg;

    const notifs = Array.from(usersToNotify).map(uid => ({
      userId: uid,
      type: 'general',
      title: `Meeting Shared: ${(meeting as any).title}`,
      message,
      relatedMeetingId: meetingId,
    }));

    if (notifs.length > 0) {
      await NotificationModel.insertMany(notifs);
    }

    logger.info(`[MeetingsService] Shared meeting ${meetingId} with ${notifs.length} user(s).`);

    return {
      success: true,
      meetingId,
      liveLink: `/meetings/live/${meetingId}`,
      workspaceLink: `/meetings/${meetingId}`,
      notifiedCount: notifs.length,
      message: `Meeting link sent to ${notifs.length} user(s) and participants successfully!`,
    };
  }
}

export const meetingsService = new MeetingsService();
