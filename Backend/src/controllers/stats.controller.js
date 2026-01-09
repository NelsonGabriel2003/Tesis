/**
 * Stats Controller
 * Maneja estadísticas del dashboard para administradores
 */

import StatsModel from '../models/stats.model.js'
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

export {
  getDashboardStats,
  getSummary,
  getUserStats,
  getPointsStats,
  getRedemptionStats,
  getRecentTransactions
}
