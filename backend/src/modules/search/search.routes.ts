import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { searchService } from './search.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req: any, res) => {
  try {
    const result = await searchService.search({
      q: req.query.q as string,
      from: req.query.from as string,
      to: req.query.to as string,
      title: req.query.title as string,
      participant: req.query.participant as string,
      userId: req.user.userId,
      role: req.user.role || 'employee',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
