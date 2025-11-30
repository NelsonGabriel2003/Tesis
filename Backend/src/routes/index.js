/**
 * Routes Index
 * Configura todas las rutas de la API
 */

const { Router } = require('express')

const authRoutes = require('./auth.routes')
const productRoutes = require('./product.routes')
const rewardRoutes = require('./reward.routes')
const serviceRoutes = require('./service.routes')
const profileRoutes = require('./profile.routes')
const statsRoutes = require('./stats.routes')

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

// Registrar rutas
router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/rewards', rewardRoutes)
router.use('/services', serviceRoutes)
router.use('/profile', profileRoutes)
router.use('/stats', statsRoutes)

module.exports = router
