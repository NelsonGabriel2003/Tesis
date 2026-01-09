import { Router } from 'express'
import { orderController } from '../controllers/index.js'
import { verifyToken } from '../middlewares/index.js'

const router = Router()

router.post('/', verifyToken, orderController.create)
router.get('/', verifyToken, orderController.getMyOrders)
router.get('/active', verifyToken, orderController.getActiveOrders)
router.get('/:id', verifyToken, orderController.getById)
router.put('/:id/cancel', verifyToken, orderController.cancel)

export default router