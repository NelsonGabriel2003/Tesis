/**
 * Stats Model
 * Consultas a la base de datos para estadísticas del dashboard
 */

const { query } = require('../config/database')

const StatsModel = {
  /**
   * Obtener conteo total de usuarios (solo rol 'user')
   */
  getTotalUsers: async () => {
    const result = await query(
      `SELECT COUNT(*) as total FROM users WHERE role = 'user'`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener conteo de usuarios por nivel
   */
  getUsersByLevel: async () => {
    const result = await query(
      `SELECT membership_level, COUNT(*) as total 
       FROM users 
       WHERE role = 'user'
       GROUP BY membership_level`
    )
    return result.rows
  },

  /**
   * Obtener conteo total de productos activos
   */
  getTotalProducts: async () => {
    const result = await query(
      `SELECT COUNT(*) as total FROM products WHERE is_available = true`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener conteo total de recompensas activas
   */
  getTotalRewards: async () => {
    const result = await query(
      `SELECT COUNT(*) as total FROM rewards WHERE is_available = true`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener conteo total de servicios activos
   */
  getTotalServices: async () => {
    const result = await query(
      `SELECT COUNT(*) as total FROM services WHERE is_available = true`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener total de canjes realizados
   */
  getTotalRedemptions: async () => {
    const result = await query(
      `SELECT COUNT(*) as total FROM redemptions`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener canjes por estado
   */
  getRedemptionsByStatus: async () => {
    const result = await query(
      `SELECT status, COUNT(*) as total 
       FROM redemptions 
       GROUP BY status`
    )
    return result.rows
  },

  /**
   * Obtener total de puntos emitidos (ganados por usuarios)
   */
  getTotalPointsIssued: async () => {
    const result = await query(
      `SELECT COALESCE(SUM(points), 0) as total 
       FROM transactions 
       WHERE type = 'earned'`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener total de puntos canjeados
   */
  getTotalPointsRedeemed: async () => {
    const result = await query(
      `SELECT COALESCE(SUM(points), 0) as total 
       FROM transactions 
       WHERE type = 'redeemed'`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener transacciones recientes
   */
  getRecentTransactions: async (limit = 10) => {
    const result = await query(
      `SELECT t.*, u.name as user_name, u.email as user_email
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT $1`,
      [limit]
    )
    return result.rows
  },

  /**
   * Obtener usuarios recientes
   */
  getRecentUsers: async (limit = 5) => {
    const result = await query(
      `SELECT id, name, email, membership_level, current_points, created_at
       FROM users 
       WHERE role = 'user'
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    )
    return result.rows
  },

  /**
   * Obtener canjes recientes
   */
  getRecentRedemptions: async (limit = 5) => {
    const result = await query(
      `SELECT r.*, u.name as user_name, rw.name as reward_name
       FROM redemptions r
       JOIN users u ON r.user_id = u.id
       JOIN rewards rw ON r.reward_id = rw.id
       ORDER BY r.created_at DESC
       LIMIT $1`,
      [limit]
    )
    return result.rows
  },

  /**
   * Obtener resumen completo del dashboard
   */
  getDashboardSummary: async () => {
    const [
      totalUsers,
      usersByLevel,
      totalProducts,
      totalRewards,
      totalServices,
      totalRedemptions,
      redemptionsByStatus,
      pointsIssued,
      pointsRedeemed,
      recentUsers,
      recentRedemptions
    ] = await Promise.all([
      StatsModel.getTotalUsers(),
      StatsModel.getUsersByLevel(),
      StatsModel.getTotalProducts(),
      StatsModel.getTotalRewards(),
      StatsModel.getTotalServices(),
      StatsModel.getTotalRedemptions(),
      StatsModel.getRedemptionsByStatus(),
      StatsModel.getTotalPointsIssued(),
      StatsModel.getTotalPointsRedeemed(),
      StatsModel.getRecentUsers(),
      StatsModel.getRecentRedemptions()
    ])

    return {
      totalUsers,
      usersByLevel,
      totalProducts,
      totalRewards,
      totalServices,
      totalRedemptions,
      redemptionsByStatus,
      pointsIssued,
      pointsRedeemed,
      recentUsers,
      recentRedemptions
    }
  }
}

module.exports = StatsModel
