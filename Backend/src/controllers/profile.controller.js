/**
 * Profile Controller
 * Maneja operaciones del perfil de usuario y transacciones
 */

import UserModel from '../models/user.model.js'
import TransactionModel from '../models/transaction.model.js'
import RedemptionModel from '../models/redemption.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener perfil completo del usuario
 * GET /api/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const user = await UserModel.findById(userId)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    })
  }

  // Calcular nivel y progreso
  const levels = [
    { name: 'bronce', minPoints: 0, maxPoints: 499 },
    { name: 'plata', minPoints: 500, maxPoints: 1499 },
    { name: 'oro', minPoints: 1500, maxPoints: 4999 },
    { name: 'platino', minPoints: 5000, maxPoints: Infinity }
  ]

  const currentLevel = levels.find(l => l.name === user.membership_level)
  const nextLevelIndex = levels.findIndex(l => l.name === user.membership_level) + 1
  const nextLevel = levels[nextLevelIndex] || null

  let progress = 100
  let pointsToNextLevel = 0

  if (nextLevel) {
    pointsToNextLevel = nextLevel.minPoints - user.total_points
    const levelRange = nextLevel.minPoints - currentLevel.minPoints
    const pointsInLevel = user.total_points - currentLevel.minPoints
    progress = Math.min(100, Math.floor((pointsInLevel / levelRange) * 100))
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      membership: {
        level: user.membership_level,
        progress,
        pointsToNextLevel,
        nextLevel: nextLevel?.name || null
      },
      points: {
        current: user.current_points,
        total: user.total_points
      },
      memberSince: user.created_at
    }
  })
})

/**
 * Obtener historial de transacciones
 * GET /api/profile/transactions
 */
const getTransactions = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { limit = 20, offset = 0 } = req.query

  const transactions = await TransactionModel.findByUserId(
    userId, 
    parseInt(limit), 
    parseInt(offset)
  )

  res.json({
    success: true,
    count: transactions.length,
    data: transactions.map(t => ({
      id: t.id,
      type: t.type,
      points: t.points,
      description: t.description,
      referenceType: t.reference_type,
      date: t.created_at
    }))
  })
})

/**
 * Obtener resumen de transacciones
 * GET /api/profile/transactions/summary
 */
const getTransactionsSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const summary = await TransactionModel.getSummary(userId)

  res.json({
    success: true,
    data: {
      totalEarned: parseInt(summary.total_earned) || 0,
      totalRedeemed: parseInt(summary.total_redeemed) || 0,
      transactionsEarned: parseInt(summary.transactions_earned) || 0,
      transactionsRedeemed: parseInt(summary.transactions_redeemed) || 0
    }
  })
})

/**
 * Obtener estadísticas del usuario
 * GET /api/profile/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { query } = await import('../config/database.js')

  // Obtener resumen de transacciones
  const transactionSummary = await TransactionModel.getSummary(userId)
  
  // Obtener estadísticas de canjes
  const redemptionStats = await RedemptionModel.getStats(userId)

  // Obtener estadísticas de pedidos
  const ordersStatsResult = await query(`
    SELECT 
      COUNT(*) FILTER (WHERE status IN ('completed', 'delivered')) as total_visits,
      COALESCE(SUM(total) FILTER (WHERE status IN ('completed', 'delivered')), 0) as total_spent,
      MAX(created_at) FILTER (WHERE status IN ('completed', 'delivered')) as last_visit
    FROM orders 
    WHERE user_id = $1
  `, [userId])

  // Obtener producto favorito (más pedido)
  const favoriteResult = await query(`
    SELECT p.name, SUM(oi.quantity) as total_quantity
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.user_id = $1 AND o.status IN ('completed', 'delivered')
    GROUP BY p.id, p.name
    ORDER BY total_quantity DESC
    LIMIT 1
  `, [userId])

  const ordersStats = ordersStatsResult.rows[0] || {}
  const favorite = favoriteResult.rows[0]

  res.json({
    success: true,
    data: {
      points: {
        totalEarned: parseInt(transactionSummary.total_earned) || 0,
        totalRedeemed: parseInt(transactionSummary.total_redeemed) || 0
      },
      redemptions: {
        total: parseInt(redemptionStats.total_redemptions) || 0,
        used: parseInt(redemptionStats.used_count) || 0,
        pending: parseInt(redemptionStats.pending_count) || 0
      },
      orders: {
        totalVisits: parseInt(ordersStats.total_visits) || 0,
        totalSpent: parseFloat(ordersStats.total_spent) || 0,
        favoriteItem: favorite?.name || '-',
        lastVisit: ordersStats.last_visit || null
      }
    }
  })
})

/**
 * Obtener niveles de membresía
 * GET /api/profile/levels
 */
const getMembershipLevels = asyncHandler(async (req, res) => {
  const levels = [
    {
      name: 'bronce',
      displayName: 'Bronce',
      minPoints: 0,
      benefits: [
        '1 punto por cada $1 gastado',
        'Acceso a recompensas básicas'
      ]
    },
    {
      name: 'plata',
      displayName: 'Plata',
      minPoints: 500,
      benefits: [
        '1.5 puntos por cada $1 gastado',
        '5% de descuento en cumpleaños',
        'Acceso a recompensas exclusivas'
      ]
    },
    {
      name: 'oro',
      displayName: 'Oro',
      minPoints: 1500,
      benefits: [
        '2 puntos por cada $1 gastado',
        '10% de descuento en cumpleaños',
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
        '20% de descuento en cumpleaños',
        'Acceso VIP permanente',
        'Estacionamiento gratuito',
        'Invitaciones a eventos privados'
      ]
    }
  ]

  res.json({
    success: true,
    data: levels
  })
})

export {
  getProfile,
  getTransactions,
  getTransactionsSummary,
  getStats,
  getMembershipLevels
}
