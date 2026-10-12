const AppError = require('../utils/AppError');

function notFound(req, res) {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, ...(err.details && { details: err.details }) },
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: { code: 'BAD_JSON', message: 'Invalid JSON body.' } });
  }
  // never leak Mongo/stack details to the client
  if (process.env.NODE_ENV !== 'test') console.error(err);
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to process your request. Please try again.' } });
}

module.exports = { notFound, errorHandler };
