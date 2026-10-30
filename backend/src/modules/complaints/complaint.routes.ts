import { Router } from 'express';
import { complaintController } from './complaint.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

export const complaintRouter = Router();

// All routes require authentication
complaintRouter.use(authenticate);

// Student & Employee endpoints
complaintRouter.post('/', (req, res, next) => complaintController.submitComplaint(req, res, next));
complaintRouter.get('/my', (req, res, next) => complaintController.getMyComplaints(req, res, next));

// Admin endpoints
complaintRouter.get('/admin', requireRole('admin'), (req, res, next) =>
  complaintController.getAdminComplaints(req, res, next)
);
complaintRouter.patch('/:id/status', requireRole('admin'), (req, res, next) =>
  complaintController.updateComplaintStatus(req, res, next)
);
