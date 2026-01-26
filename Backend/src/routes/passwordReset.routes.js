/**
 * Password Reset Routes
 * Rutas para recuperación de contraseña
 */

import { Router } from 'express'
import {
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendCode
} from '../controllers/passwordReset.controller.js'

const router = Router()

// POST /api/auth/forgot-password - Solicitar código
router.post('/forgot-password', forgotPassword)

// POST /api/auth/verify-reset-code - Verificar código
router.post('/verify-reset-code', verifyResetCode)

// POST /api/auth/reset-password - Cambiar contraseña
router.post('/reset-password', resetPassword)

// POST /api/auth/resend-code - Reenviar código
router.post('/resend-code', resendCode)

export default router
