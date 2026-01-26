/**
 * Auth Routes
 * Rutas para autenticación
 */

import { Router } from 'express'
import { login, register, getMe, updateMe } from '../controllers/auth.controller.js'
import {
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendCode
} from '../controllers/passwordReset.controller.js'
import { verifyToken } from '../middlewares/index.js'

const router = Router()

// Rutas públicas
router.post('/login', login)
router.post('/register', register)

// Rutas de recuperación de contraseña
router.post('/forgot-password', forgotPassword)
router.post('/verify-reset-code', verifyResetCode)
router.post('/reset-password', resetPassword)
router.post('/resend-code', resendCode)

// Rutas protegidas
router.get('/me', verifyToken, getMe)
router.put('/me', verifyToken, updateMe)

export default router
