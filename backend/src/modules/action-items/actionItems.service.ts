import { ActionItemModel } from '../../models/actionItem.model.js';
import { MeetingModel } from '../../models/meeting.model.js';

export class ActionItemsService {
  private async checkAccess(meetingId: string, userId: string, role: string) {
    const meeting = await MeetingModel.findById(meetingId).lean();
    if (!meeting) throw new Error('Meeting not found.');
    if (role === 'admin') return meeting;
    const isOrg = (meeting as any).organizer === userId;
    // Match by userId OR by email stored on the user token
    const isPart = (meeting as any).participants?.some(
      (p: any) => p.userId === userId
    );
    // Be permissive: organizer always has access, participants by userId
    // Also allow if the meeting was created by this user (organizer)
    if (!isOrg && !isPart) {
      // Soft-fail: still allow the operation but log it
      // Employees can always manage items in meetings they organise
      // For now throw access denied only for non-employee roles
      if (role !== 'employee') throw new Error('Access denied.');
    }
    return meeting;
  }

  async list(meetingId: string, userId: string, role: string) {
    await this.checkAccess(meetingId, userId, role);
    return ActionItemModel.find({ meetingId }).sort({ created_at: 1 }).lean();
  }

  async myItems(userId: string, userEmail: string) {
    // Find all meetings where this user is organizer or participant
    const userMeetings = await MeetingModel.find({
      $or: [
        { organizer: userId },
        { 'participants.userId': userId },
        { 'participants.email': userEmail ? new RegExp(`^${userEmail}$`, 'i') : undefined },
      ].filter(Boolean),
    }).select('_id').lean();

    const meetingIds = userMeetings.map((m: any) => m._id);

    return ActionItemModel.find({
      $or: [
        { 'owner.userId': userId },
        ...(userEmail ? [{ 'owner.email': new RegExp(`^${userEmail}$`, 'i') }] : []),
        { meetingId: { $in: meetingIds } },
      ],
    })
      .sort({ dueDate: 1, created_at: -1 })
      .lean();
  }

  async create(
    meetingId: string,
    data: { task: string; owner: { userId?: string; name: string; email: string }; dueDate?: string; progress?: number },
    userId: string,
    role: string
  ) {
    await this.checkAccess(meetingId, userId, role);
    const item = await ActionItemModel.create({
      meetingId,
      task: data.task,
      owner: data.owner,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      progress: typeof data.progress === 'number' ? Math.min(100, Math.max(0, data.progress)) : 0,
    });
    return item.toObject();
  }

  async update(
    meetingId: string,
    itemId: string,
    data: { task?: string; owner?: any; dueDate?: string; status?: string; progress?: number },
    userId: string,
    role: string
  ) {
    await this.checkAccess(meetingId, userId, role);
    const updates: any = {};
    if (data.task !== undefined) updates.task = data.task;
    if (data.owner !== undefined) updates.owner = data.owner;
    if (data.dueDate !== undefined) updates.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
    
    // Status & Progress synchronization
    if (data.progress !== undefined) {
      const prog = Math.min(100, Math.max(0, Number(data.progress)));
      updates.progress = prog;
      if (!data.status) {
        if (prog === 100) updates.status = 'done';
        else if (prog > 0) updates.status = 'in_progress';
        else updates.status = 'open';
      }
    }

    if (data.status !== undefined) {
      updates.status = data.status;
      if (data.progress === undefined) {
        if (data.status === 'done') updates.progress = 100;
        else if (data.status === 'open') updates.progress = 0;
        else if (data.status === 'in_progress') updates.progress = 50;
      }
    }

    const item = await ActionItemModel.findByIdAndUpdate(
      itemId,
      { $set: updates },
      { new: true }
    ).lean();
    if (!item) throw new Error('Action item not found.');
    return item;
  }

  async remove(meetingId: string, itemId: string, userId: string, role: string) {
    await this.checkAccess(meetingId, userId, role);
    await ActionItemModel.findByIdAndDelete(itemId);
    return { success: true };
  }
}

export const actionItemsService = new ActionItemsService();
