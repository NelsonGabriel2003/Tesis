/**
 * Staff Controller
 * Maneja operaciones del personal
 */

import PersonalModel from '../models/personal.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener todo el personal
 * GET /api/staff
 */
const getAll = asyncHandler(async (req, res) => {
  const personal = await PersonalModel.obtenerTodos(true)
  res.json({
    success: true,
    data: personal.map(p => ({
      id: p.id,
      name: p.nombre,
      phone: p.telefono,
      email: p.correo,
      role: p.rol,
      isOnShift: p.en_turno,
      telegramLinked: !!p.telegram_chat_id,
      telegramUsername: p.telegram_username,
      linkCode: p.codigo_vinculacion,
      linkCodeExpires: p.expiracion_codigo
    }))
  })
})

/**
 * Obtener un miembro del personal
 * GET /api/staff/:id
 */
const getById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const personal = await PersonalModel.buscarPorId(id)

  if (!personal) {
    return res.status(404).json({ success: false, message: 'Personal no encontrado' })
  }

  res.json({
    success: true,
    data: {
      id: personal.id,
      name: personal.nombre,
      phone: personal.telefono,
      email: personal.correo,
      role: personal.rol,
      isOnShift: personal.en_turno,
      telegramLinked: !!personal.telegram_chat_id,
      telegramUsername: personal.telegram_username,
      linkCode: personal.codigo_vinculacion,
      linkCodeExpires: personal.expiracion_codigo
    }
  })
})

/**
 * Crear nuevo personal
 * POST /api/staff
 */
const create = asyncHandler(async (req, res) => {
  const { name, phone, email, role } = req.body
  if (!name) {
    return res.status(400).json({ success: false, message: 'El nombre es requerido' })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const personal = await PersonalModel.crear({
    nombre: name,
    telefono: phone,
    correo: email,
    rol: role
  }, req.user?.id, infoSolicitud)

  res.status(201).json({ success: true, data: personal, message: 'Personal creado' })
})

/**
 * Actualizar personal
 * PUT /api/staff/:id
 */
const update = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, phone, email, role } = req.body

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const personal = await PersonalModel.actualizar(id, {
    nombre: name,
    telefono: phone,
    correo: email,
    rol: role
  }, req.user?.id, infoSolicitud)

  if (!personal) {
    return res.status(404).json({ success: false, message: 'Personal no encontrado' })
  }

  res.json({ success: true, data: personal, message: 'Personal actualizado' })
})

/**
 * Generar código de vinculación
 * POST /api/staff/:id/generate-code
 */
const generateLinkCode = asyncHandler(async (req, res) => {
  const { id } = req.params
  const personal = await PersonalModel.buscarPorId(id)

  if (!personal) {
    return res.status(404).json({ success: false, message: 'Personal no encontrado' })
  }

  if (personal.telegram_chat_id) {
    return res.status(400).json({
      success: false,
      message: 'Este personal ya tiene Telegram vinculado'
    })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const actualizado = await PersonalModel.generarCodigoVinculacion(id, req.user?.id, infoSolicitud)

  res.json({
    success: true,
    data: {
      name: actualizado.nombre,
      linkCode: actualizado.codigo_vinculacion,
      expiresAt: actualizado.expiracion_codigo
    },
    message: `Código generado: ${actualizado.codigo_vinculacion} (válido por 24 horas)`
  })
})

/**
 * Desvincular Telegram
 * DELETE /api/staff/:id/telegram
 */
const unlinkTelegram = asyncHandler(async (req, res) => {
  const { id } = req.params
  const personal = await PersonalModel.buscarPorId(id)

  if (!personal) {
    return res.status(404).json({ success: false, message: 'Personal no encontrado' })
  }

  if (!personal.telegram_chat_id) {
    return res.status(400).json({ success: false, message: 'No tiene Telegram vinculado' })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  await PersonalModel.desvincularTelegram(id, req.user?.id, infoSolicitud)
  res.json({ success: true, message: 'Telegram desvinculado correctamente' })
})

/**
 * Cambiar estado de turno
 * PUT /api/staff/:id/shift
 */
const toggleShift = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { isOnShift } = req.body
  const personal = await PersonalModel.buscarPorId(id)

  if (!personal) {
    return res.status(404).json({ success: false, message: 'Personal no encontrado' })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const personalActualizado = await PersonalModel.establecerEstadoTurno(id, isOnShift, req.user?.id, infoSolicitud)
  res.json({
    success: true,
    data: personalActualizado,
    message: isOnShift ? 'Turno iniciado' : 'Turno finalizado'
  })
})

/**
 * Obtener personal en turno
 * GET /api/staff/on-shift
 */
const getOnShift = asyncHandler(async (req, res) => {
  const personal = await PersonalModel.obtenerEnTurno()
  res.json({ success: true, data: personal })
})

/**
 * Eliminar (desactivar) personal
 * DELETE /api/staff/:id
 */
const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const personal = await PersonalModel.eliminar(id, req.user?.id, infoSolicitud)

  if (!personal) {
    return res.status(404).json({ success: false, message: 'Personal no encontrado' })
  }

  res.json({ success: true, message: 'Personal eliminado' })
})

export const staffController = {
  getAll,
  getById,
  create,
  update,
  generateLinkCode,
  unlinkTelegram,
  toggleShift,
  getOnShift,
  delete: deleteStaff
}
