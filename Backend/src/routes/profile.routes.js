/**
 * Profile Routes
 * Rutas para perfil de usuario
 */

import { Router } from 'express'
import {
  getProfile,
  getTransactions,
  getTransactionsSummary,
  getStats,
  getMembershipLevels
} from '../controllers/profile.controller.js'
import { updateMe } from '../controllers/auth.controller.js'
import { verifyToken } from '../middlewares/index.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(verifyToken)

// Rutas de perfil
router.get('/', getProfile)
router.put('/', updateMe)
router.get('/transactions', getTransactions)
router.get('/transactions/summary', getTransactionsSummary)
router.get('/stats', getStats)
router.get('/levels', getMembershipLevels)

export default router
