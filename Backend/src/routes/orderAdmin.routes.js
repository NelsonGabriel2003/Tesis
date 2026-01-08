const express = require('express')
const router = express.Router()
const { orderController } = require('../controllers')
const { verifyToken } = require('../middlewares')

router.get('/pending', verifyToken, orderController.getPending)
router.put('/:id/approve', verifyToken, orderController.approve)
router.put('/:id/reject', verifyToken, orderController.reject)
router.put('/:id/complete', verifyToken, orderController.complete)

module.exports = router