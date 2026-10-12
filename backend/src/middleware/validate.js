const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const first = result.array()[0];
  next(new AppError(400, 'VALIDATION_ERROR', first.msg, result.array().map((e) => ({ field: e.path, message: e.msg }))));
};
