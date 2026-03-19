import { Router } from 'express';
import { createAppointment, getAppointments, updateAppointment, getAvailableSlots } from '../controllers/appointmentController.js';

const router = Router();

router.get('/slots', getAvailableSlots);
router.post('/', createAppointment);
router.get('/', getAppointments);
router.patch('/:id', updateAppointment);

export default router;
