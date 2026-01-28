import { Router } from 'express'
import { orderController } from '../controllers/index.js'
import { verifyToken } from '../middlewares/index.js'

const router = Router()

router.get('/pending', verifyToken, orderController.getPending)
router.put('/:id/approve', verifyToken, orderController.approve)
router.put('/:id/reject', verifyToken, orderController.reject)
router.put('/:id/complete', verifyToken, orderController.complete)

export default router