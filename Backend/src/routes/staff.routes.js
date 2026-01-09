import { Router } from 'express'
import { staffController } from '../controllers/index.js'
import { verifyToken, verifyAdmin } from '../middlewares/index.js'

const router = Router()

// Rutas públicas para staff autenticado
router.get('/', verifyToken, staffController.getAll)
router.get('/on-shift', verifyToken, staffController.getOnShift)
router.get('/:id', verifyToken, staffController.getById)

// Rutas de administración (requieren rol admin)
router.post('/', verifyToken, verifyAdmin, staffController.create)
router.put('/:id', verifyToken, verifyAdmin, staffController.update)
router.delete('/:id', verifyToken, verifyAdmin, staffController.delete)
router.put('/:id/shift', verifyToken, staffController.toggleShift)

// Gestión de vinculación Telegram
router.post('/:id/generate-code', verifyToken, verifyAdmin, staffController.generateLinkCode)
router.delete('/:id/telegram', verifyToken, verifyAdmin, staffController.unlinkTelegram)

export default router
