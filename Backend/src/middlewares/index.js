/**
 * Middlewares Index
 */

import { verifyToken, optionalAuth, requireRole } from './auth.middleware.js'
import { notFound, errorHandler, asyncHandler } from './error.middleware.js'

// Helper para verificar admin
const verifyAdmin = requireRole('admin')

export {
  verifyToken,
  optionalAuth,
  requireRole,
  verifyAdmin,
  notFound,
  errorHandler,
  asyncHandler
}
