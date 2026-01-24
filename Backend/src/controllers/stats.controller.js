/**
 * Stats Controller
 * Maneja estadísticas del dashboard para administradores
 */

import StatsModel from '../models/stats.model.js'
import { asyncHandler } from '../middlewares/index.js'
import UserModel from '../models/user.model.js'
import { asyncHandler } from '../middlewares/index.js'
/**
 * Obtener resumen completo del dashboard
 * GET /api/stats/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await StatsModel.getDashboardSummary()

  res.json({
    success: true,
    data: stats
  })
})

/**
 * Obtener solo contadores principales
 * GET /api/stats/summary
 */
const getSummary = asyncHandler(async (req, res) => {
  const [totalUsers, totalProducts, totalRedemptions, pointsIssued] = await Promise.all([
    StatsModel.getTotalUsers(),
    StatsModel.getTotalProducts(),
    StatsModel.getTotalRedemptions(),
    StatsModel.getTotalPointsIssued()
  ])

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalRedemptions,
      pointsIssued
    }
  })
})

/**
 * Obtener estadísticas de usuarios
 * GET /api/stats/users
 */
const getUserStats = asyncHandler(async (req, res) => {
  const [totalUsers, usersByLevel, recentUsers] = await Promise.all([
    StatsModel.getTotalUsers(),
    StatsModel.getUsersByLevel(),
    StatsModel.getRecentUsers(10)
  ])

  res.json({
    success: true,
    data: {
      totalUsers,
      usersByLevel,
      recentUsers
    }
  })
})

/**
 * Obtener estadísticas de puntos
 * GET /api/stats/points
 */
const getPointsStats = asyncHandler(async (req, res) => {
  const [pointsIssued, pointsRedeemed] = await Promise.all([
    StatsModel.getTotalPointsIssued(),
    StatsModel.getTotalPointsRedeemed()
  ])

  res.json({
    success: true,
    data: {
      pointsIssued,
      pointsRedeemed,
      pointsBalance: pointsIssued - pointsRedeemed
    }
  })
})

/**
 * Obtener estadísticas de canjes
 * GET /api/stats/redemptions
 */
const getRedemptionStats = asyncHandler(async (req, res) => {
  const [totalRedemptions, redemptionsByStatus, recentRedemptions] = await Promise.all([
    StatsModel.getTotalRedemptions(),
    StatsModel.getRedemptionsByStatus(),
    StatsModel.getRecentRedemptions(10)
  ])

  res.json({
    success: true,
    data: {
      totalRedemptions,
      redemptionsByStatus,
      recentRedemptions
    }
  })
})

/**
 * Obtener transacciones recientes
 * GET /api/stats/transactions
 */
const getRecentTransactions = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query
  
  const transactions = await StatsModel.getRecentTransactions(parseInt(limit))

  res.json({
    success: true,
    data: transactions
  })
})


/**
 * Obtener canjes de un usuario específico (para admin)
 * GET /api/stats/users/:id/canjes
 */
const obtenerCanjesUsuario = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Obtener datos del usuario
  const usuario = await UserModel.findById(parseInt(id))

  if (!usuario) {
    return res.status(404).json({
      exito: false,
      mensaje: 'Usuario no encontrado'
    })
  }

  // Obtener canjes con resumen
  const { canjes, resumen } = await RedemptionModel.obtenerCanjesConResumen(parseInt(id))

  res.json({
    exito: true,
    usuario: {
      id: usuario.id,
      nombre: usuario.name,
      correo: usuario.email,
      puntosActuales: usuario.current_points,
      nivelMembresia: usuario.membership_level
    },
    canjes: canjes.map(canje => ({
      id: canje.id,
      recompensa: canje.reward_name,
      categoria: canje.reward_category,
      codigo: canje.redemption_code,
      puntosGastados: canje.points_spent,
      estado: canje.status,
      fechaCanje: canje.created_at,
      fechaUso: canje.used_at
    })),
    resumen: {
      totalCanjes: parseInt(resumen.total_canjes),
      puntosCanjeados: parseInt(resumen.puntos_canjeados) || 0
    }
  })
})

/**
 * Marcar canje como usado desde admin
 * POST /api/stats/canjes/:id/entregar
 */
const entregarCanje = asyncHandler(async (req, res) => {
  const { id } = req.params

  const canjeActualizado = await RedemptionModel.markAsUsed(parseInt(id))

  if (!canjeActualizado) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Canje no encontrado o ya fue utilizado'
    })
  }

  res.json({
    exito: true,
    mensaje: 'Canje procesado exitosamente',
    canje: {
      id: canjeActualizado.id,
      estado: canjeActualizado.status,
      fechaUso: canjeActualizado.used_at
    }
  })
})

export {
  getDashboardStats,
  getSummary,
  getUserStats,
  getPointsStats,
  getRedemptionStats,
  getRecentTransactions,
  obtenerCanjesUsuario,
  entregarCanje
}
