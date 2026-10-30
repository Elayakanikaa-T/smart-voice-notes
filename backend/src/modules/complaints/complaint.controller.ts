import { Response, NextFunction } from 'express';
import { ComplaintModel } from '../../models/complaint.model.js';
import { UserModel } from '../../models/user.model.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { logger } from '../../utils/logger.js';

export class ComplaintController {
  // 1. Submit a complaint (Student or Employee)
  async submitComplaint(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, subject, description, priority } = req.body;

      if (!subject || !subject.trim()) {
        res.status(400).json({ success: false, error: 'Please enter a complaint subject.' });
        return;
      }

      if (!description || !description.trim()) {
        res.status(400).json({ success: false, error: 'Please describe the problem or issue you are experiencing.' });
        return;
      }

      const user = await UserModel.findById(req.user!.userId).lean();
      const userName = (user as any)?.name || 'App User';
      const userEmail = (user as any)?.email || req.user?.email || 'user@example.com';
      const userRole = (user as any)?.role || req.user?.role || 'student';

      const complaint = await ComplaintModel.create({
        userId: req.user!.userId,
        userName,
        userEmail,
        userRole,
        category: category || 'technical',
        subject: subject.trim(),
        description: description.trim(),
        priority: priority || 'medium',
        status: 'pending',
      });

      logger.info(`[Complaint] New ticket #${complaint._id} submitted by ${userName} (${userRole})`);

      res.status(201).json({
        success: true,
        message: 'Your complaint has been submitted successfully to the administrator. We will review and resolve it promptly.',
        data: complaint,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to submit complaint.' });
    }
  }

  // 2. Get current user's submitted complaints
  async getMyComplaints(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const complaints = await ComplaintModel.find({ userId: req.user!.userId })
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({ success: true, data: complaints });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch complaints.' });
    }
  }

  // 3. Admin: Get all complaints across students and employees
  async getAdminComplaints(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, role, category, page = 1, limit = 50 } = req.query;
      const query: any = {};

      if (status && status !== 'all') {
        query.status = status;
      }
      if (role && role !== 'all') {
        query.userRole = role;
      }
      if (category && category !== 'all') {
        query.category = category;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const total = await ComplaintModel.countDocuments(query);
      const complaints = await ComplaintModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      const counts = {
        all: await ComplaintModel.countDocuments({}),
        pending: await ComplaintModel.countDocuments({ status: 'pending' }),
        in_progress: await ComplaintModel.countDocuments({ status: 'in_progress' }),
        resolved: await ComplaintModel.countDocuments({ status: 'resolved' }),
      };

      res.status(200).json({
        success: true,
        data: {
          complaints,
          total,
          counts,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch complaints for admin.' });
    }
  }

  // 4. Admin: Update status & resolution notes
  async updateComplaintStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!status || !['pending', 'in_progress', 'resolved'].includes(status)) {
        res.status(400).json({ success: false, error: 'Invalid status provided.' });
        return;
      }

      const updateData: any = { status };
      if (typeof adminNotes === 'string') {
        updateData.adminNotes = adminNotes.trim();
      }
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }

      const updated = await ComplaintModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) {
        res.status(404).json({ success: false, error: 'Complaint not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Complaint marked as ${status}.`,
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to update complaint.' });
    }
  }
}

export const complaintController = new ComplaintController();
