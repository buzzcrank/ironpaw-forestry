import { Router } from 'express';
import { createQuote, estimateQuote, getQuotes, updateQuote } from '../controllers/quoteController.js';
import { validateQuoteEstimate } from '../middleware/validate.js';

const router = Router();

router.post('/estimate', estimateQuote);
router.post('/', createQuote);
router.get('/', getQuotes);
router.patch('/:id', updateQuote);

export default router;
