/**
 * Profile Controller
 * Maneja operaciones del perfil de usuario y movimientos de puntos
 */

import UsuarioModel from '../models/usuario.model.js'
import MovimientoModel from '../models/movimiento.model.js'
import CanjeModel from '../models/canje.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener perfil completo del usuario
 * GET /api/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const usuarioId = req.user.id

  const usuario = await UsuarioModel.buscarPorId(usuarioId)

  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    })
  }

  // Calcular nivel y progreso
  const niveles = [
    { name: 'bronce', minPoints: 0, maxPoints: 499 },
    { name: 'plata', minPoints: 500, maxPoints: 1499 },
    { name: 'oro', minPoints: 1500, maxPoints: 4999 },
    { name: 'platino', minPoints: 5000, maxPoints: Infinity }
  ]

  const nivelActual = niveles.find(n => n.name === usuario.nivel_membresia)
  const indiceSiguienteNivel = niveles.findIndex(n => n.name === usuario.nivel_membresia) + 1
  const siguienteNivel = niveles[indiceSiguienteNivel] || null

  let progreso = 100
  let puntosParaSiguienteNivel = 0

  if (siguienteNivel) {
    puntosParaSiguienteNivel = siguienteNivel.minPoints - usuario.puntos_totales
    const rangoNivel = siguienteNivel.minPoints - nivelActual.minPoints
    const puntosEnNivel = usuario.puntos_totales - nivelActual.minPoints
    progreso = Math.min(100, Math.floor((puntosEnNivel / rangoNivel) * 100))
  }

  res.json({
    success: true,
    data: {
      id: usuario.id,
      email: usuario.correo,
      name: usuario.nombre,
      phone: usuario.telefono,
      role: usuario.rol,
      membership: {
        level: usuario.nivel_membresia,
        progress: progreso,
        pointsToNextLevel: puntosParaSiguienteNivel,
        nextLevel: siguienteNivel?.name || null
      },
      points: {
        current: usuario.puntos_actuales,
        total: usuario.puntos_totales
      }
    }
  })
})

/**
 * Obtener historial de movimientos de puntos
 * GET /api/profile/transactions
 */
const getTransactions = asyncHandler(async (req, res) => {
  const usuarioId = req.user.id
  const { limit = 20, offset = 0 } = req.query

  const movimientos = await MovimientoModel.obtenerPorUsuario(
    usuarioId,
    parseInt(limit),
    parseInt(offset)
  )

  res.json({
    success: true,
    count: movimientos.length,
    data: movimientos.map(m => ({
      id: m.id,
      type: m.tipo,
      points: m.puntos,
      description: m.descripcion,
      referenceType: m.tipo_referencia,
      date: m.fecha_movimiento
    }))
  })
})

/**
 * Obtener resumen de movimientos
 * GET /api/profile/transactions/summary
 */
const getTransactionsSummary = asyncHandler(async (req, res) => {
  const usuarioId = req.user.id

  const resumen = await MovimientoModel.obtenerResumen(usuarioId)

  res.json({
    success: true,
    data: {
      totalEarned: parseInt(resumen.total_ganado) || 0,
      totalRedeemed: parseInt(resumen.total_canjeado) || 0,
      transactionsEarned: parseInt(resumen.movimientos_ganados) || 0,
      transactionsRedeemed: parseInt(resumen.movimientos_canjeados) || 0
    }
  })
})

/**
 * Obtener estadisticas del usuario
 * GET /api/profile/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const usuarioId = req.user.id
  const { query } = await import('../config/database.js')

  // Obtener resumen de movimientos
  const resumenMovimientos = await MovimientoModel.obtenerResumen(usuarioId)

  // Obtener estadisticas de canjes
  const estadisticasCanjes = await CanjeModel.obtenerEstadisticas(usuarioId)

  // Obtener estadisticas de pedidos
  const estadisticasPedidosResult = await query(`
    SELECT
      COUNT(*) FILTER (WHERE estado IN ('completado', 'entregado')) as total_visitas,
      COALESCE(SUM(total) FILTER (WHERE estado IN ('completado', 'entregado')), 0) as total_gastado,
      MAX(fecha_pedido) FILTER (WHERE estado IN ('completado', 'entregado')) as ultima_visita
    FROM pedidos
    WHERE usuario_id = $1
  `, [usuarioId])

  // Obtener producto favorito (mas pedido)
  const favoritoResult = await query(`
    SELECT p.nombre, SUM(ip.cantidad) as cantidad_total
    FROM items_pedido ip
    JOIN pedidos pe ON pe.id = ip.pedido_id
    JOIN productos p ON p.id = ip.producto_id
    WHERE pe.usuario_id = $1 AND pe.estado IN ('completado', 'entregado')
    GROUP BY p.id, p.nombre
    ORDER BY cantidad_total DESC
    LIMIT 1
  `, [usuarioId])

  const estadisticasPedidos = estadisticasPedidosResult.rows[0] || {}
  const favorito = favoritoResult.rows[0]

  res.json({
    success: true,
    data: {
      points: {
        totalEarned: parseInt(resumenMovimientos.total_ganado) || 0,
        totalRedeemed: parseInt(resumenMovimientos.total_canjeado) || 0
      },
      redemptions: {
        total: parseInt(estadisticasCanjes.total_canjes) || 0,
        used: parseInt(estadisticasCanjes.usados) || 0,
        pending: parseInt(estadisticasCanjes.pendientes) || 0
      },
      orders: {
        totalVisits: parseInt(estadisticasPedidos.total_visitas) || 0,
        totalSpent: parseFloat(estadisticasPedidos.total_gastado) || 0,
        favoriteItem: favorito?.nombre || '-',
        lastVisit: estadisticasPedidos.ultima_visita || null
      }
    }
  })
})

/**
 * Obtener niveles de membresia
 * GET /api/profile/levels
 */
const getMembershipLevels = asyncHandler(async (req, res) => {
  const niveles = [
    {
      name: 'bronce',
      displayName: 'Bronce',
      minPoints: 0,
      benefits: [
        '1 punto por cada $1 gastado',
        'Acceso a recompensas basicas'
      ]
    },
    {
      name: 'plata',
      displayName: 'Plata',
      minPoints: 500,
      benefits: [
        '1.5 puntos por cada $1 gastado',
        '5% de descuento en cumpleanos',
        'Acceso a recompensas exclusivas'
      ]
    },
    {
      name: 'oro',
      displayName: 'Oro',
      minPoints: 1500,
      benefits: [
        '2 puntos por cada $1 gastado',
        '10% de descuento en cumpleanos',
        'Reserva prioritaria',
        'Acceso a eventos exclusivos'
      ]
    },
    {
      name: 'platino',
      displayName: 'Platino',
      minPoints: 5000,
      benefits: [
        '3 puntos por cada $1 gastado',
        '20% de descuento en cumpleanos',
        'Acceso VIP permanente',
        'Estacionamiento gratuito',
        'Invitaciones a eventos privados'
      ]
    }
  ]

  res.json({
    success: true,
    data: niveles
  })
})

export {
  getProfile,
  getTransactions,
  getTransactionsSummary,
  getStats,
  getMembershipLevels
}
