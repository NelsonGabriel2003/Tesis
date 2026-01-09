/**
 * Auth Routes
 * Rutas para autenticación
 */

import { Router } from 'express'
import { login, register, getMe, updateMe } from '../controllers/auth.controller.js'
import { verifyToken } from '../middlewares/index.js'

const router = Router()

// Rutas públicas
router.post('/login', login)
router.post('/register', register)

// Rutas protegidas
router.get('/me', verifyToken, getMe)
router.put('/me', verifyToken, updateMe)

export default router
