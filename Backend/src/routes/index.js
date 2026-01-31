
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
import configRoutes from './config.routes.js'
import adminConfigRoutes from './adminConfig.routes.js'
import uploadRoutes from './upload.routes.js'
import photoRoutes from './photo.routes.js'
import searchRoutes from './search.routes.js'

const router = Router()

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

router.use('/comprobante', comprobanteRoutes)

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

// Rutas de configuración del negocio
router.use('/config', configRoutes)

// Rutas de configuración de admin
router.use('/admin/config', adminConfigRoutes)

// Rutas de subida de imágenes
router.use('/upload', uploadRoutes)

// Rutas de fotos/eventos
router.use('/photos', photoRoutes)

// Ruta de búsqueda global
router.use('/search', searchRoutes)

export default router