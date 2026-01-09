/**
 * Routes Index
 * Configura todas las rutas de la API
 */

import { Router } from 'express'

import authRoutes from './auth.routes.js'
import productRoutes from './product.routes.js'
import rewardRoutes from './reward.routes.js'
import serviceRoutes from './service.routes.js'
import profileRoutes from './profile.routes.js'
import statsRoutes from './stats.routes.js'
import orderRoutes from './order.routes.js'
import orderAdminRoutes from './orderAdmin.routes.js'
import staffRoutes from './staff.routes.js'
import telegramRoutes from './telegram.routes.js'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

// Rutas existentes
router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/rewards', rewardRoutes)
router.use('/services', serviceRoutes)
router.use('/profile', profileRoutes)
router.use('/stats', statsRoutes)

// Rutas nuevas de pedidos
router.use('/orders', orderRoutes)
router.use('/admin/orders', orderAdminRoutes)
router.use('/staff', staffRoutes)

// Rutas de Telegram Bot (webhook)
router.use('/telegram', telegramRoutes)

export default router