/**
 * Password Reset Controller
 * Maneja la recuperación de contraseña por código
 */

import bcrypt from 'bcryptjs'
import UsuarioModel from '../models/usuario.model.js'
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

  const usuario = await UsuarioModel.buscarPorCorreo(email)
  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: 'No existe una cuenta con este email'
    })
  }

  const codigo = generarCodigo()
  await UsuarioModel.guardarCodigoRecuperacion(email, codigo, CONFIG_RESET.MINUTOS_EXPIRACION)

  if (metodo === 'telegram') {
    console.log(`📱 Recuperación por Telegram - Usuario: ${usuario.correo}, ChatID: ${usuario.telegram_chat_id || 'NO VINCULADO'}`)
    
    if (!usuario.telegram_chat_id) {
      return res.status(400).json({
        success: false,
        message: 'No tienes Telegram vinculado. Usa el correo electrónico.'
      })
    }

    console.log(`📤 Enviando código a Telegram ChatID: ${usuario.telegram_chat_id}`)
    
    const mensajeEnviado = await telegramService.sendMessage(
      usuario.telegram_chat_id,
      `🔐 *Código de Recuperación*\n\nTu código es: *${codigo}*\n\n⏰ Expira en ${CONFIG_RESET.MINUTOS_EXPIRACION} minutos.\n\nSi no solicitaste esto, ignora este mensaje.`,
      { parse_mode: 'Markdown' }
    )

    console.log(`📬 Resultado envío: ${mensajeEnviado ? 'ÉXITO' : 'FALLÓ'}`)

    if (!mensajeEnviado) {
      return res.status(500).json({
        success: false,
        message: 'Error al enviar código por Telegram. Intenta con correo electrónico.'
      })
    }
  } else if (metodo === 'email') {
    await emailService.enviarCodigoRecuperacion(
      usuario.correo,
      usuario.nombre,
      codigo,
      CONFIG_RESET.MINUTOS_EXPIRACION
    )
  }

  res.json({
    success: true,
    message: `Código enviado por ${metodo === 'telegram' ? 'Telegram' : 'correo'}`,
    data: {
      email: usuario.correo,
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

  const usuario = await UsuarioModel.verificarCodigoRecuperacion(email, codigo)

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
      email: usuario.correo,
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

  const usuario = await UsuarioModel.verificarCodigoRecuperacion(email, codigo)
  if (!usuario) {
    return res.status(400).json({
      success: false,
      message: 'Código inválido o expirado'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(nuevaPassword, saltRounds)

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  await UsuarioModel.cambiarContrasena(email, passwordHash, infoSolicitud)

  // Enviar confirmación por email
  await emailService.enviarConfirmacionCambio(usuario.correo, usuario.nombre)

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

  const usuario = await UsuarioModel.buscarPorCorreo(email)
  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: 'No existe una cuenta con este email'
    })
  }

  res.json({
    success: true,
    data: {
      email: usuario.correo,
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