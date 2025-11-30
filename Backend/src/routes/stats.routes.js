/**
 * Stats Routes
 * Rutas para estadísticas del dashboard (solo admin)
 */

const { Router } = require('express')
const { 
  getDashboardStats,
  getSummary,
  getUserStats,
  getPointsStats,
  getRedemptionStats,
  getRecentTransactions
} = require('../controllers/stats.controller')
const { verifyToken, requireRole } = require('../middlewares')

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

module.exports = router
