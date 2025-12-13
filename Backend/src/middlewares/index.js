/**
 * Middlewares Index
 */

const { verifyToken, optionalAuth, requireRole } = require('./auth.middleware')
const { notFound, errorHandler, asyncHandler } = require('./error.middleware')

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  notFound,
  errorHandler,
  asyncHandler
}
