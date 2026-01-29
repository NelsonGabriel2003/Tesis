/**
 * Password Reset Controller
 * Maneja la recuperación de contraseña por código
 */

import bcrypt from 'bcryptjs'
import UserModel from '../models/user.model.js'
import telegramService from '../services/telegram.service.js'
import emailService from '../services/email.service.js'
import { asyncHandler } from '../middlewares/index.js'

// Configuración de recuperación
const CONFIG_RESET = {
  MINUTOS_EXPIRACION: 15,
  LONGITUD_CODIGO: 6,
  MIN_PASSWORD: 6
}

/**
 * Genera código alfanumérico aleatorio (mayúsculas y números)
 */
const generarCodigo = (longitud = CONFIG_RESET.LONGITUD_CODIGO) => {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin I, O, 0, 1 para evitar confusión
  let codigo = ''
  for (let i = 0; i < longitud; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return codigo
}

/**
 * Solicitar código de recuperación
 * POST /api/auth/forgot-password
 */
const solicitarCodigo = asyncHandler(async (req, res) => {
  const { email, metodo } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email es requerido'
    })
  }

  const usuario = await UserModel.findByEmail(email)
  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: 'No existe una cuenta con este email'
    })
  }

  const codigo = generarCodigo()
  await UserModel.guardarCodigoReset(email, codigo, CONFIG_RESET.MINUTOS_EXPIRACION)

  if (metodo === 'telegram') {
    if (!usuario.telegram_chat_id) {
      return res.status(400).json({
        success: false,
        message: 'No tienes Telegram vinculado. Usa el correo electrónico.'
      })
    }

    await telegramService.sendMessage(
      usuario.telegram_chat_id,
      `Tu código de recuperación es: *${codigo}*\n\nExpira en ${CONFIG_RESET.MINUTOS_EXPIRACION} minutos.`,
      { parse_mode: 'Markdown' }
    )
  } else if (metodo === 'email') {
    await emailService.enviarCodigoRecuperacion(
      usuario.email,
      usuario.name,
      codigo,
      CONFIG_RESET.MINUTOS_EXPIRACION
    )
  }

  res.json({
    success: true,
    message: `Código enviado por ${metodo === 'telegram' ? 'Telegram' : 'correo'}`,
    data: {
      email: usuario.email,
      metodo,
      tieneTelegram: !!usuario.telegram_chat_id
    }
  })
})

/**
 * Verificar código de recuperación
 * POST /api/auth/verify-code
 */
const verificarCodigo = asyncHandler(async (req, res) => {
  const { email, codigo } = req.body

  if (!email || !codigo) {
    return res.status(400).json({
      success: false,
      message: 'Email y código son requeridos'
    })
  }

  const usuario = await UserModel.verificarCodigoReset(email, codigo)

  if (!usuario) {
    return res.status(400).json({
      success: false,
      message: 'Código inválido o expirado'
    })
  }

  res.json({
    success: true,
    message: 'Código verificado correctamente',
    data: {
      email: usuario.email,
      verificado: true
    }
  })
})

/**
 * Cambiar contraseña
 * POST /api/auth/reset-password
 */
const cambiarPassword = asyncHandler(async (req, res) => {
  const { email, codigo, nuevaPassword } = req.body

  if (!email || !codigo || !nuevaPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email, código y nueva contraseña son requeridos'
    })
  }

  if (nuevaPassword.length < CONFIG_RESET.MIN_PASSWORD) {
    return res.status(400).json({
      success: false,
      message: `La contraseña debe tener al menos ${CONFIG_RESET.MIN_PASSWORD} caracteres`
    })
  }

  const usuario = await UserModel.verificarCodigoReset(email, codigo)
  if (!usuario) {
    return res.status(400).json({
      success: false,
      message: 'Código inválido o expirado'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(nuevaPassword, saltRounds)

  await UserModel.cambiarPassword(email, passwordHash)

  // Enviar confirmación por email
  await emailService.enviarConfirmacionCambio(usuario.email, usuario.name)

  res.json({
    success: true,
    message: 'Contraseña actualizada correctamente'
  })
})

/**
 * Verificar métodos de recuperación disponibles
 * POST /api/auth/check-recovery-methods
 */
const verificarMetodosRecuperacion = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email es requerido'
    })
  }

  const usuario = await UserModel.findByEmail(email)
  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: 'No existe una cuenta con este email'
    })
  }

  res.json({
    success: true,
    data: {
      email: usuario.email,
      tieneTelegram: !!usuario.telegram_chat_id,
      tieneEmail: true
    }
  })
})

export {
  solicitarCodigo,
  verificarCodigo,
  cambiarPassword,
  verificarMetodosRecuperacion
}
