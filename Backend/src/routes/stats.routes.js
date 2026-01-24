/**
 * Stats Routes
 * Rutas para estadísticas del dashboard (solo admin)
 */

import { Router } from 'express'
import {
  getDashboardStats,
  getSummary,
  getUserStats,
  getPointsStats,
  getRedemptionStats,
  getRecentTransactions,
  obtenerCanjesUsuario,
  entregarCanje
} from '../controllers/stats.controller.js'
import { verifyToken, requireRole } from '../middlewares/index.js'

const router = Router()

// Todas las rutas requieren autenticación y rol admin
router.use(verifyToken)
router.use(requireRole('admin'))

// Rutas de estadísticas
router.get('/dashboard', getDashboardStats)
router.get('/summary', getSummary)
router.get('/users', getUserStats)
router.get('/points', getPointsStats)
router.get('/redemptions', getRedemptionStats)
router.get('/transactions', getRecentTransactions)


// Rutas para canjes de usuario (admin)
router.get('/users/:id/canjes', obtenerCanjesUsuario)
router.post('/canjes/:id/entregar', entregarCanje)


export default router
