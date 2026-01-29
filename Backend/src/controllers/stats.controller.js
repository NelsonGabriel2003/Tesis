/**
 * Stats Controller
 * Maneja estadísticas del dashboard para administradores
 */

import EstadisticasModel from '../models/estadisticas.model.js'
import CanjeModel from '../models/canje.model.js'
import UsuarioModel from '../models/usuario.model.js'
import { asyncHandler } from '../middlewares/index.js'
/**
 * Obtener resumen completo del dashboard
 * GET /api/stats/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await EstadisticasModel.obtenerResumenDashboard()

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
  const [totalUsuarios, totalProductos, totalCanjes, puntosEmitidos] = await Promise.all([
    EstadisticasModel.obtenerTotalUsuarios(),
    EstadisticasModel.obtenerTotalProductos(),
    EstadisticasModel.obtenerTotalCanjes(),
    EstadisticasModel.obtenerTotalPuntosEmitidos()
  ])

  res.json({
    success: true,
    data: {
      totalUsers: totalUsuarios,
      totalProducts: totalProductos,
      totalRedemptions: totalCanjes,
      pointsIssued: puntosEmitidos
    }
  })
})

/**
 * Obtener estadísticas de usuarios
 * GET /api/stats/users
 */
const getUserStats = asyncHandler(async (req, res) => {
  const [totalUsuarios, usuariosPorNivel, usuariosRecientes] = await Promise.all([
    EstadisticasModel.obtenerTotalUsuarios(),
    EstadisticasModel.obtenerUsuariosPorNivel(),
    EstadisticasModel.obtenerUsuariosRecientes(10)
  ])

  res.json({
    success: true,
    data: {
      totalUsers: totalUsuarios,
      usersByLevel: usuariosPorNivel,
      recentUsers: usuariosRecientes
    }
  })
})

/**
 * Obtener estadísticas de puntos
 * GET /api/stats/points
 */
const getPointsStats = asyncHandler(async (req, res) => {
  const [puntosEmitidos, puntosCanjeados] = await Promise.all([
    EstadisticasModel.obtenerTotalPuntosEmitidos(),
    EstadisticasModel.obtenerTotalPuntosCanjeados()
  ])

  res.json({
    success: true,
    data: {
      pointsIssued: puntosEmitidos,
      pointsRedeemed: puntosCanjeados,
      pointsBalance: puntosEmitidos - puntosCanjeados
    }
  })
})

/**
 * Obtener estadísticas de canjes
 * GET /api/stats/redemptions
 */
const getRedemptionStats = asyncHandler(async (req, res) => {
  const [totalCanjes, canjesPorEstado, canjesRecientes] = await Promise.all([
    EstadisticasModel.obtenerTotalCanjes(),
    EstadisticasModel.obtenerCanjesPorEstado(),
    EstadisticasModel.obtenerCanjesRecientes(10)
  ])

  res.json({
    success: true,
    data: {
      totalRedemptions: totalCanjes,
      redemptionsByStatus: canjesPorEstado,
      recentRedemptions: canjesRecientes
    }
  })
})

/**
 * Obtener transacciones recientes
 * GET /api/stats/transactions
 */
const getRecentTransactions = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query

  const movimientos = await EstadisticasModel.obtenerMovimientosRecientes(parseInt(limit))

  res.json({
    success: true,
    data: movimientos
  })
})


/**
 * Obtener canjes de un usuario específico (para admin)
 * GET /api/stats/users/:id/canjes
 */
const obtenerCanjesUsuario = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Obtener datos del usuario
  const usuario = await UsuarioModel.buscarPorId(parseInt(id))

  if (!usuario) {
    return res.status(404).json({
      exito: false,
      mensaje: 'Usuario no encontrado'
    })
  }

  // Obtener canjes con resumen
  const { canjes, resumen } = await CanjeModel.obtenerConResumenPorUsuario(parseInt(id))

  res.json({
    exito: true,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      puntosActuales: usuario.puntos_actuales,
      nivelMembresia: usuario.nivel_membresia
    },
    canjes: canjes.map(canje => ({
      id: canje.id,
      recompensa: canje.nombre_recompensa,
      categoria: canje.categoria_recompensa,
      codigo: canje.codigo_canje,
      puntosGastados: canje.puntos_gastados,
      estado: canje.estado,
      fechaCanje: canje.fecha_canje,
      fechaUso: canje.fecha_uso
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

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const canjeActualizado = await CanjeModel.marcarComoUsado(parseInt(id), req.user?.id, infoSolicitud)

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
      estado: canjeActualizado.estado,
      fechaUso: canjeActualizado.fecha_uso
    }
  })
})

/**
 * Obtener todos los canjes para panel admin (con polling)
 * GET /api/stats/canjes
 */
const obtenerTodosCanjes = asyncHandler(async (req, res) => {
  const { status, limit = 50 } = req.query

  const [canjes, resumen] = await Promise.all([
    CanjeModel.obtenerTodosConUsuarios(status || null, parseInt(limit)),
    CanjeModel.obtenerResumenAdmin()
  ])

  res.json({
    exito: true,
    timestamp: new Date().toISOString(),
    resumen: {
      total: parseInt(resumen.total),
      pendientes: parseInt(resumen.pendientes),
      usados: parseInt(resumen.usados),
      puntosTotales: parseInt(resumen.puntos_totales) || 0
    },
    canjes: canjes.map(canje => ({
      id: canje.id,
      usuarioId: canje.usuario_id,
      usuarioNombre: canje.nombre_usuario,
      usuarioEmail: canje.correo_usuario,
      recompensa: canje.nombre_recompensa,
      categoria: canje.categoria_recompensa,
      codigo: canje.codigo_canje,
      puntosGastados: canje.puntos_gastados,
      estado: canje.estado,
      fechaCanje: canje.fecha_canje,
      fechaUso: canje.fecha_uso
    }))
  })
})

/**
 * Obtener solo canjes pendientes (para notificaciones)
 * GET /api/stats/canjes/pendientes
 */
const obtenerCanjesPendientes = asyncHandler(async (req, res) => {
  const canjes = await CanjeModel.obtenerPendientes()

  res.json({
    exito: true,
    timestamp: new Date().toISOString(),
    cantidad: canjes.length,
    canjes: canjes.map(canje => ({
      id: canje.id,
      usuarioId: canje.usuario_id,
      usuarioNombre: canje.nombre_usuario,
      usuarioEmail: canje.correo_usuario,
      recompensa: canje.nombre_recompensa,
      categoria: canje.categoria_recompensa,
      codigo: canje.codigo_canje,
      puntosGastados: canje.puntos_gastados,
      fechaCanje: canje.fecha_canje
    }))
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
  entregarCanje,
  obtenerTodosCanjes,
  obtenerCanjesPendientes
}
