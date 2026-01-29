/**
 * Reward Controller
 * Maneja operaciones de recompensas y canjes
 */

import RecompensaModel from '../models/recompensa.model.js'
import CanjeModel from '../models/canje.model.js'
import UsuarioModel from '../models/usuario.model.js'
import MovimientoModel from '../models/movimiento.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Genera un codigo unico de canje
 */
const generarCodigoCanje = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = ''
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

/**
 * Obtener todas las recompensas
 * GET /api/rewards
 */
const getRewards = asyncHandler(async (req, res) => {
  const { category } = req.query

  const recompensas = await RecompensaModel.obtenerTodas(category)

  res.json({
    success: true,
    count: recompensas.length,
    data: recompensas.map(r => ({
      id: r.id,
      name: r.nombre,
      description: r.descripcion,
      pointsCost: r.puntos_requeridos,
      category: r.categoria,
      imageUrl: r.imagen_url,
      stock: r.stock,
      isPopular: r.es_popular
    }))
  })
})

/**
 * Obtener recompensa por ID
 * GET /api/rewards/:id
 */
const getRewardById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const recompensa = await RecompensaModel.buscarPorId(id)

  if (!recompensa) {
    return res.status(404).json({
      success: false,
      message: 'Recompensa no encontrada'
    })
  }

  res.json({
    success: true,
    data: {
      id: recompensa.id,
      name: recompensa.nombre,
      description: recompensa.descripcion,
      pointsCost: recompensa.puntos_requeridos,
      category: recompensa.categoria,
      imageUrl: recompensa.imagen_url,
      stock: recompensa.stock,
      isPopular: recompensa.es_popular
    }
  })
})

/**
 * Canjear una recompensa
 * POST /api/rewards/:id/redeem
 */
const redeemReward = asyncHandler(async (req, res) => {
  const { id } = req.params
  const usuarioId = req.user.id

  // Obtener recompensa
  const recompensa = await RecompensaModel.buscarPorId(id)

  if (!recompensa) {
    return res.status(404).json({
      success: false,
      message: 'Recompensa no encontrada'
    })
  }

  if (!recompensa.disponible || recompensa.stock <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Recompensa no disponible'
    })
  }

  // Obtener usuario
  const usuario = await UsuarioModel.buscarPorId(usuarioId)

  if (usuario.puntos_actuales < recompensa.puntos_requeridos) {
    return res.status(400).json({
      success: false,
      message: 'No tienes suficientes puntos',
      required: recompensa.puntos_requeridos,
      available: usuario.puntos_actuales
    })
  }

  // Generar codigo de canje
  const codigoCanje = generarCodigoCanje()

  // Restar puntos al usuario
  const usuarioActualizado = await UsuarioModel.restarPuntos(usuarioId, recompensa.puntos_requeridos)

  // Reducir stock de la recompensa
  await RecompensaModel.reducirStock(id)

  // Crear registro de canje
  const canje = await CanjeModel.crear({
    usuario_id: usuarioId,
    recompensa_id: id,
    puntos_gastados: recompensa.puntos_requeridos,
    codigo_canje: codigoCanje
  })

  // Registrar movimiento de puntos
  await MovimientoModel.crear({
    usuario_id: usuarioId,
    tipo: 'canjeado',
    puntos: recompensa.puntos_requeridos,
    descripcion: `Canje: ${recompensa.nombre}`,
    tipo_referencia: 'canje',
    referencia_id: canje.id
  })

  res.status(201).json({
    success: true,
    message: 'Canje realizado exitosamente',
    data: {
      redemptionCode: codigoCanje,
      reward: {
        name: recompensa.nombre,
        pointsSpent: recompensa.puntos_requeridos
      },
      newBalance: usuarioActualizado.puntos_actuales
    }
  })
})

/**
 * Obtener mis canjes
 * GET /api/rewards/my-redemptions
 */
const getMyRedemptions = asyncHandler(async (req, res) => {
  const usuarioId = req.user.id
  const { limit = 20, offset = 0 } = req.query

  const canjes = await CanjeModel.obtenerPorUsuario(usuarioId, parseInt(limit), parseInt(offset))

  res.json({
    success: true,
    count: canjes.length,
    data: canjes.map(c => ({
      id: c.id,
      rewardName: c.nombre_recompensa,
      rewardCategory: c.categoria_recompensa,
      pointsSpent: c.puntos_gastados,
      redemptionCode: c.codigo_canje,
      status: c.estado,
      createdAt: c.fecha_canje,
      usedAt: c.fecha_uso
    }))
  })
})

/**
 * Validar codigo de canje (para empleados)
 * GET /api/rewards/validate/:code
 */
const validateRedemptionCode = asyncHandler(async (req, res) => {
  const { code } = req.params

  const canje = await CanjeModel.buscarPorCodigo(code.toUpperCase())

  if (!canje) {
    return res.status(404).json({
      success: false,
      message: 'Codigo de canje no encontrado'
    })
  }

  res.json({
    success: true,
    data: {
      id: canje.id,
      rewardName: canje.nombre_recompensa,
      userName: canje.nombre_usuario,
      status: canje.estado,
      createdAt: canje.fecha_canje,
      usedAt: canje.fecha_uso
    }
  })
})

/**
 * Marcar canje como usado (para empleados)
 * POST /api/rewards/use/:code
 */
const useRedemptionCode = asyncHandler(async (req, res) => {
  const { code } = req.params

  const canje = await CanjeModel.marcarComoUsadoPorCodigo(code.toUpperCase())

  if (!canje) {
    return res.status(400).json({
      success: false,
      message: 'Codigo invalido o ya fue utilizado'
    })
  }

  res.json({
    success: true,
    message: 'Canje procesado exitosamente',
    data: {
      id: canje.id,
      status: canje.estado,
      usedAt: canje.fecha_uso
    }
  })
})

/**
 * Obtener categorias de recompensas
 * GET /api/rewards/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categorias = await RecompensaModel.obtenerCategorias()

  res.json({
    success: true,
    data: categorias
  })
})

/**
 * Crear recompensa (Admin)
 * POST /api/rewards
 */
const createReward = asyncHandler(async (req, res) => {
  const { name, description, points_cost, category, image_url, stock, is_popular } = req.body

  if (!name || !points_cost || !category) {
    return res.status(400).json({
      success: false,
      message: 'Nombre, costo en puntos y categoria son requeridos'
    })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const recompensa = await RecompensaModel.crear({
    nombre: name,
    descripcion: description,
    puntos_requeridos: points_cost,
    categoria: category,
    imagen_url: image_url,
    stock,
    es_popular: is_popular
  }, req.user?.id, infoSolicitud)

  res.status(201).json({
    success: true,
    message: 'Recompensa creada exitosamente',
    data: recompensa
  })
})

/**
 * Actualizar recompensa (Admin)
 * PUT /api/rewards/:id
 */
const updateReward = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, description, points_cost, category, image_url, stock, is_popular, is_available } = req.body

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const recompensa = await RecompensaModel.actualizar(id, {
    nombre: name,
    descripcion: description,
    puntos_requeridos: points_cost,
    categoria: category,
    imagen_url: image_url,
    stock,
    es_popular: is_popular,
    disponible: is_available
  }, req.user?.id, infoSolicitud)

  if (!recompensa) {
    return res.status(404).json({
      success: false,
      message: 'Recompensa no encontrada'
    })
  }

  res.json({
    success: true,
    message: 'Recompensa actualizada',
    data: recompensa
  })
})

export {
  getRewards,
  getRewardById,
  redeemReward,
  getMyRedemptions,
  validateRedemptionCode,
  useRedemptionCode,
  getCategories,
  createReward,
  updateReward
}
