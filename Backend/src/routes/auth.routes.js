/**
 * Auth Routes
 * Rutas para autenticación
 */

const { Router } = require('express')
const { login, register, getMe, updateMe } = require('../controllers/auth.controller')
const { verifyToken } = require('../middlewares')

const router = Router()

// Rutas públicas
router.post('/login', login)
router.post('/register', register)

// Rutas protegidas
router.get('/me', verifyToken, getMe)
router.put('/me', verifyToken, updateMe)

module.exports = router
