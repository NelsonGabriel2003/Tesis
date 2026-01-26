/**
 * Password Reset Controller
 * Maneja la recuperación de contraseñas
 */

import bcrypt from 'bcryptjs'
import UserModel from '../models/user.model.js'
import PasswordResetModel from '../models/passwordReset.model.js'
import { sendPasswordResetCode } from '../config/resend.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Genera código de 6 dígitos
 */
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Ocultar email parcialmente (ej: j***@gmail.com)
 */
const maskEmail = (email) => {
  const [name, domain] = email.split('@')
  const masked = name.charAt(0) + '***'
  return `${masked}@${domain}`
}

/**
 * Solicitar código de recuperación
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'El email es requerido'
    })
  }

  // Buscar usuario
  const user = await UserModel.findByEmail(email.toLowerCase())

  // Siempre respondemos igual (seguridad: no revelar si el email existe)
  const successResponse = {
    success: true,
    message: 'Si el email existe, recibirás un código de verificación',
    maskedEmail: maskEmail(email)
  }

  if (!user) {
    return res.json(successResponse)
  }

  // Verificar si ya hay un código reciente (evitar spam)
  const hasRecent = await PasswordResetModel.hasRecentCode(email, 1)
  if (hasRecent) {
    return res.status(429).json({
      success: false,
      message: 'Ya enviamos un código. Espera 1 minuto antes de solicitar otro.'
    })
  }

  // Generar código y fecha de expiración (10 minutos)
  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  // Guardar en BD
  await PasswordResetModel.create({
    userId: user.id,
    email: email.toLowerCase(),
    code,
    expiresAt
  })

  // Enviar email
  const emailResult = await sendPasswordResetCode(email, code, user.name)

  if (!emailResult.success) {
    console.error('Error enviando email:', emailResult.error)
    // No revelamos el error exacto al usuario
  }

  res.json(successResponse)
})

/**
 * Verificar código
 * POST /api/auth/verify-reset-code
 */
const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: 'Email y código son requeridos'
    })
  }

  // Buscar código válido
  const resetRecord = await PasswordResetModel.findValidCode(
    email.toLowerCase(),
    code
  )

  if (!resetRecord) {
    return res.status(400).json({
      success: false,
      message: 'Código inválido o expirado'
    })
  }

  // Código válido - generamos un token temporal para el siguiente paso
  const resetToken = Buffer.from(`${resetRecord.id}:${code}:${Date.now()}`).toString('base64')

  res.json({
    success: true,
    message: 'Código verificado correctamente',
    resetToken
  })
})

/**
 * Cambiar contraseña
 * POST /api/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword, resetToken } = req.body

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    })
  }

  // Validar longitud de contraseña
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres'
    })
  }

  // Buscar código válido
  const resetRecord = await PasswordResetModel.findValidCode(
    email.toLowerCase(),
    code
  )

  if (!resetRecord) {
    return res.status(400).json({
      success: false,
      message: 'Código inválido o expirado. Solicita uno nuevo.'
    })
  }

  // Hashear nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // Actualizar contraseña del usuario
  await UserModel.updatePassword(resetRecord.user_id, hashedPassword)

  // Marcar código como usado
  await PasswordResetModel.markAsUsed(resetRecord.id)

  res.json({
    success: true,
    message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'
  })
})

/**
 * Reenviar código
 * POST /api/auth/resend-code
 */
const resendCode = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'El email es requerido'
    })
  }

  // Verificar rate limit
  const hasRecent = await PasswordResetModel.hasRecentCode(email, 1)
  if (hasRecent) {
    return res.status(429).json({
      success: false,
      message: 'Espera 1 minuto antes de solicitar otro código'
    })
  }

  // Buscar usuario
  const user = await UserModel.findByEmail(email.toLowerCase())

  if (!user) {
    // No revelar que el email no existe
    return res.json({
      success: true,
      message: 'Si el email existe, recibirás un nuevo código'
    })
  }

  // Generar y guardar nuevo código
  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await PasswordResetModel.create({
    userId: user.id,
    email: email.toLowerCase(),
    code,
    expiresAt
  })

  // Enviar email
  await sendPasswordResetCode(email, code, user.name)

  res.json({
    success: true,
    message: 'Nuevo código enviado'
  })
})

export {
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendCode
}
