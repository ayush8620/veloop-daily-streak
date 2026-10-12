const { body, query, header } = require('express-validator');

const register = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail({ gmail_remove_dots: false }),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters'),
];

const login = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail({ gmail_remove_dots: false }),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

const claim = [
  body('day').optional().isInt({ min: 1, max: 31 }).withMessage('day must be a number'),
  header('idempotency-key').optional().isString().isLength({ min: 8, max: 100 }).withMessage('Invalid Idempotency-Key'),
];

const pagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const timeTravel = [body('hours').isFloat({ min: -1000, max: 1000 }).withMessage('hours must be a number')];

module.exports = { register, login, claim, pagination, timeTravel };
