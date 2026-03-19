import { body, validationResult } from 'express-validator';

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

export const validateLead = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 255 }),
  body('phone').trim().notEmpty().withMessage('Phone is required.')
    .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage('Invalid phone number.'),
  body('email').optional().isEmail().withMessage('Invalid email address.').normalizeEmail(),
  body('message').optional().isLength({ max: 2000 }),
  handleValidation,
];

export const validateQuoteEstimate = [
  body('acreage').isFloat({ min: 0.1, max: 10000 }).withMessage('Acreage must be between 0.1 and 10000.'),
  body('vegetation_density').isIn(['light', 'medium', 'heavy', 'very_heavy']).withMessage('Invalid density.'),
  handleValidation,
];
