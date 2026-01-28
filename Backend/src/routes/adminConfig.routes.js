import express from 'express'
import adminConfigController from '../controllers/adminConfig.controller.js'
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación y ser admin
router.use(verifyToken)
router.use(isAdmin)

// GET /api/admin/config - Obtener todas
router.get('/', adminConfigController.getAll)

// GET /api/admin/config/membership - Config de membresía
router.get('/membership', adminConfigController.getMembership)

// GET /api/admin/config/points - Config de puntos
router.get('/points', adminConfigController.getPoints)

// GET /api/admin/config/category/:category - Por categoría
router.get('/category/:category', adminConfigController.getByCategory)

// PUT /api/admin/config/batch - Actualizar múltiples
router.put('/batch', adminConfigController.updateMany)

// PUT /api/admin/config/:key - Actualizar una
router.put('/:key', adminConfigController.update)

export default router