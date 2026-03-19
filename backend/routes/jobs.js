import { Router } from 'express';
import { createJob, getJobs, updateJob } from '../controllers/jobController.js';

const router = Router();

router.post('/', createJob);
router.get('/', getJobs);
router.patch('/:id', updateJob);

export default router;
