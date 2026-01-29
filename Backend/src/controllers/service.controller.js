/**
 * Service Controller
 * Maneja operaciones de servicios del bar
 */

import ServicioModel from '../models/servicio.model.js'
import UsuarioModel from '../models/usuario.model.js'
import MovimientoModel from '../models/movimiento.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener todos los servicios
 * GET /api/services
 */
const getServices = asyncHandler(async (req, res) => {
  const { category } = req.query

  const servicios = await ServicioModel.obtenerTodos(category)

  res.json({
    success: true,
    count: servicios.length,
    data: servicios.map(servicio => ({
      id: servicio.id,
      name: servicio.nombre,
      description: servicio.descripcion,
      pointsRequired: servicio.puntos_requeridos,
      pointsEarned: servicio.puntos_otorgados,
      category: servicio.categoria,
      imageUrl: servicio.imagen_url
    }))
  })
})

/**
 * Obtener servicio por ID
 * GET /api/services/:id
 */
const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const servicio = await ServicioModel.buscarPorId(id)

  if (!servicio) {
    return res.status(404).json({
      success: false,
      message: 'Servicio no encontrado'
    })
  }

  res.json({
    success: true,
    data: {
      id: servicio.id,
      name: servicio.nombre,
      description: servicio.descripcion,
      pointsRequired: servicio.puntos_requeridos,
      pointsEarned: servicio.puntos_otorgados,
      category: servicio.categoria,
      imageUrl: servicio.imagen_url
    }
  })
})

/**
 * Reservar un servicio
 * POST /api/services/:id/book
 */
const bookService = asyncHandler(async (req, res) => {
  const { id } = req.params
  const usuarioId = req.user.id
  const { date, time, notes } = req.body

  // Obtener servicio
  const servicio = await ServicioModel.buscarPorId(id)

  if (!servicio) {
    return res.status(404).json({
      success: false,
      message: 'Servicio no encontrado'
    })
  }

  // Obtener usuario
  const usuario = await UsuarioModel.buscarPorId(usuarioId)

  // Verificar si tiene suficientes puntos (si el servicio los requiere)
  if (servicio.puntos_requeridos > 0 && usuario.puntos_actuales < servicio.puntos_requeridos) {
    return res.status(400).json({
      success: false,
      message: 'No tienes suficientes puntos para este servicio',
      required: servicio.puntos_requeridos,
      available: usuario.puntos_actuales
    })
  }

  let usuarioActualizado = usuario

  // Descontar puntos si el servicio los requiere
  if (servicio.puntos_requeridos > 0) {
    usuarioActualizado = await UsuarioModel.restarPuntos(usuarioId, servicio.puntos_requeridos)

    // Registrar movimiento de puntos usados
    await MovimientoModel.crear({
      usuario_id: usuarioId,
      tipo: 'canjeado',
      puntos: servicio.puntos_requeridos,
      descripcion: `Servicio: ${servicio.nombre}`,
      tipo_referencia: 'servicio',
      referencia_id: servicio.id
    })
  }

  // Agregar puntos ganados por usar el servicio
  if (servicio.puntos_otorgados > 0) {
    usuarioActualizado = await UsuarioModel.agregarPuntos(usuarioId, servicio.puntos_otorgados)

    // Registrar movimiento de puntos ganados
    await MovimientoModel.crear({
      usuario_id: usuarioId,
      tipo: 'ganado',
      puntos: servicio.puntos_otorgados,
      descripcion: `Bonus por servicio: ${servicio.nombre}`,
      tipo_referencia: 'servicio',
      referencia_id: servicio.id
    })
  }

  res.status(201).json({
    success: true,
    message: 'Servicio reservado exitosamente',
    data: {
      service: {
        name: servicio.nombre,
        pointsUsed: servicio.puntos_requeridos,
        pointsEarned: servicio.puntos_otorgados
      },
      booking: {
        date,
        time,
        notes
      },
      newBalance: usuarioActualizado.puntos_actuales
    }
  })
})

/**
 * Obtener categorías de servicios
 * GET /api/services/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categorias = await ServicioModel.obtenerCategorias()

  res.json({
    success: true,
    data: categorias
  })
})

/**
 * Crear servicio (Admin)
 * POST /api/services
 */
const createService = asyncHandler(async (req, res) => {
  const { name, description, points_required, points_earned, category, image_url } = req.body

  if (!name || !category) {
    return res.status(400).json({
      success: false,
      message: 'Nombre y categoría son requeridos'
    })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const servicio = await ServicioModel.crear({
    nombre: name,
    descripcion: description,
    puntos_requeridos: points_required,
    puntos_otorgados: points_earned,
    categoria: category,
    imagen_url: image_url
  }, req.user?.id, infoSolicitud)

  res.status(201).json({
    success: true,
    message: 'Servicio creado exitosamente',
    data: servicio
  })
})

/**
 * Actualizar servicio (Admin)
 * PUT /api/services/:id
 */
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, description, points_required, points_earned, category, image_url, is_available } = req.body

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const servicio = await ServicioModel.actualizar(id, {
    nombre: name,
    descripcion: description,
    puntos_requeridos: points_required,
    puntos_otorgados: points_earned,
    categoria: category,
    imagen_url: image_url,
    disponible: is_available
  }, req.user?.id, infoSolicitud)

  if (!servicio) {
    return res.status(404).json({
      success: false,
      message: 'Servicio no encontrado'
    })
  }

  res.json({
    success: true,
    message: 'Servicio actualizado',
    data: servicio
  })
})

export {
  getServices,
  getServiceById,
  bookService,
  getCategories,
  createService,
  updateService
}
