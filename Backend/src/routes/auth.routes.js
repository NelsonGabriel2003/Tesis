/**
 * Auth Routes
 * Rutas para autenticación
 */

import { Router } from 'express'
import { login, register, getMe, updateMe } from '../controllers/auth.controller.js'
import {
  solicitarCodigo,
  verificarCodigo,
  cambiarPassword,
  verificarMetodosRecuperacion
} from '../controllers/passwordReset.controller.js'
import { verifyToken } from '../middlewares/index.js'

const router = Router()

// Rutas públicas
router.post('/login', login)
router.post('/register', register)

// Rutas de recuperación de contraseña (públicas)
router.post('/check-recovery-methods', verificarMetodosRecuperacion)
router.post('/forgot-password', solicitarCodigo)
router.post('/verify-code', verificarCodigo)
router.post('/reset-password', cambiarPassword)

// Rutas protegidas
router.get('/me', verifyToken, getMe)
router.put('/me', verifyToken, updateMe)

export default router
