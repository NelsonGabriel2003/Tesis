const express = require('express')
const router = express.Router()
const { orderController } = require('../controllers')
const { verifyToken } = require('../middlewares')

router.post('/', verifyToken, orderController.create)
router.get('/', verifyToken, orderController.getMyOrders)
router.get('/active', verifyToken, orderController.getActiveOrders)
router.get('/:id', verifyToken, orderController.getById)
router.put('/:id/cancel', verifyToken, orderController.cancel)

module.exports = router