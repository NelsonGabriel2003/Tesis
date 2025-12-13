/**
 * Profile Routes
 * Rutas para perfil de usuario
 */

const { Router } = require('express')
const { 
  getProfile, 
  getTransactions, 
  getTransactionsSummary,
  getStats,
  getMembershipLevels
} = require('../controllers/profile.controller')
const { verifyToken } = require('../middlewares')

const router = Router()

// Todas las rutas requieren autenticación
router.use(verifyToken)

// Rutas de perfil
router.get('/', getProfile)
router.get('/transactions', getTransactions)
router.get('/transactions/summary', getTransactionsSummary)
router.get('/stats', getStats)
router.get('/levels', getMembershipLevels)

module.exports = router
