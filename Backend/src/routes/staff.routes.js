const express = require('express')
const router = express.Router()
const { staffController } = require('../controllers')
const { verifyToken } = require('../middlewares')

router.get('/', verifyToken, staffController.getAll)
router.get('/on-shift', verifyToken, staffController.getOnShift)
router.post('/', verifyToken, staffController.create)
router.put('/:id/shift', verifyToken, staffController.toggleShift)

module.exports = router