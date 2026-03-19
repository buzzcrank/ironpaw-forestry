import { Router } from 'express';
import { createLead, getLeads, getLead, updateLead, getLeadStats } from '../controllers/leadController.js';
import { leadLimiter } from '../middleware/rateLimit.js';
import { validateLead } from '../middleware/validate.js';

const router = Router();

router.post('/', leadLimiter, validateLead, createLead);
router.get('/', getLeads);
router.get('/stats', getLeadStats);
router.get('/:id', getLead);
router.patch('/:id', updateLead);

export default router;
