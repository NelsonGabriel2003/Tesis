/**
 * Redemption Model
 * Consultas a la base de datos para canjes realizados
 */

import { query } from '../config/database.js'

const RedemptionModel = {
  /**
   * Crear un nuevo canje
   */
  create: async (redemptionData) => {
    const { user_id, reward_id, points_spent, redemption_code } = redemptionData
    const result = await query(
      `INSERT INTO redemptions (user_id, reward_id, points_spent, redemption_code, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [user_id, reward_id, points_spent, redemption_code]
    )
    return result.rows[0]
  },

  /**
   * Obtener canje por ID
   */
  findById: async (id) => {
    const result = await query(
      `SELECT r.*, rw.name as reward_name, rw.description as reward_description
       FROM redemptions r
       JOIN rewards rw ON r.reward_id = rw.id
       WHERE r.id = $1`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Obtener canje por código
   */
  findByCode: async (code) => {
    const result = await query(
      `SELECT r.*, rw.name as reward_name, u.name as user_name
       FROM redemptions r
       JOIN rewards rw ON r.reward_id = rw.id
       JOIN users u ON r.user_id = u.id
       WHERE r.redemption_code = $1`,
      [code]
    )
    return result.rows[0]
  },

  /**
   * Obtener canjes de un usuario
   */
  findByUserId: async (userId, limit = 20, offset = 0) => {
    const result = await query(
      `SELECT r.id, r.points_spent, r.redemption_code, r.status, r.created_at, r.used_at,
              rw.name as reward_name, rw.category as reward_category
       FROM redemptions r
       JOIN rewards rw ON r.reward_id = rw.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )
    return result.rows
  },

  /**
   * Marcar canje como usado
   */
  markAsUsed: async (id) => {
    const result = await query(
      `UPDATE redemptions 
       SET status = 'used', used_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Marcar canje como usado por código
   */
  markAsUsedByCode: async (code) => {
    const result = await query(
      `UPDATE redemptions 
       SET status = 'used', used_at = CURRENT_TIMESTAMP
       WHERE redemption_code = $1 AND status = 'pending'
       RETURNING *`,
      [code]
    )
    return result.rows[0]
  },

  /**
   * Cancelar canje
   */
  cancel: async (id, userId) => {
    const result = await query(
      `UPDATE redemptions 
       SET status = 'cancelled'
       WHERE id = $1 AND user_id = $2 AND status = 'pending'
       RETURNING *`,
      [id, userId]
    )
    return result.rows[0]
  },

  /**
   * Obtener estadísticas de canjes del usuario
   */
  getStats: async (userId) => {
    const result = await query(
      `SELECT 
         COUNT(*) as total_redemptions,
         COUNT(CASE WHEN status = 'used' THEN 1 END) as used_count,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
         SUM(points_spent) as total_points_redeemed
       FROM redemptions
       WHERE user_id = $1`,
      [userId]
    )
    return result.rows[0]
  },

  
  /**
   * Obtener canjes de usuario con resumen (para admin)
   */
  obtenerCanjesConResumen: async (userId) => {
    const canjesResult = await query(
      `SELECT r.id, r.points_spent, r.redemption_code, r.status, r.created_at, r.used_at,
              rw.name as reward_name, rw.category as reward_category
       FROM redemptions r
       JOIN rewards rw ON r.reward_id = rw.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    )

    const resumenResult = await query(
      `SELECT 
         COUNT(*) as total_canjes,
         COALESCE(SUM(points_spent), 0) as puntos_canjeados
       FROM redemptions
       WHERE user_id = $1`,
      [userId]
    )

    return {
      canjes: canjesResult.rows,
      resumen: resumenResult.rows[0]
    }
  },

  /**
   * Contar canjes por usuario (para listado)
   */
  contarPorUsuario: async (userId) => {
    const result = await query(
      `SELECT COUNT(*) as total FROM redemptions WHERE user_id = $1`,
      [userId]
    )
    return parseInt(result.rows[0].total)
  }
}

export default RedemptionModel
