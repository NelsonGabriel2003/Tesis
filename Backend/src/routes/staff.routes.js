import { Router } from 'express'
import { staffController } from '../controllers/index.js'
import { verifyToken } from '../middlewares/index.js'

const router = Router()

router.get('/', verifyToken, staffController.getAll)
router.get('/on-shift', verifyToken, staffController.getOnShift)
router.post('/', verifyToken, staffController.create)
router.put('/:id/shift', verifyToken, staffController.toggleShift)

export default router