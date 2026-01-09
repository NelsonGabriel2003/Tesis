/**
 * Transaction Model
 * Consultas a la base de datos para historial de transacciones de puntos
 */

import { query } from '../config/database.js'

const TransactionModel = {
  /**
   * Crear transacción de puntos
   * @param {Object} transactionData
   * @param {number} transactionData.user_id - ID del usuario
   * @param {string} transactionData.type - 'earned' | 'redeemed' | 'expired' | 'bonus'
   * @param {number} transactionData.points - Cantidad de puntos
   * @param {string} transactionData.description - Descripción de la transacción
   * @param {string} transactionData.reference_type - 'order' | 'redemption' | 'service' | 'promotion'
   * @param {number} transactionData.reference_id - ID de la orden/canje/etc
   */
  create: async (transactionData) => {
    const { user_id, type, points, description, reference_type, reference_id } = transactionData
    const result = await query(
      `INSERT INTO transactions (user_id, type, points, description, reference_type, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, type, points, description, reference_type, reference_id]
    )
    return result.rows[0]
  },

  /**
   * Obtener historial de transacciones de un usuario
   */
  findByUserId: async (userId, limit = 20, offset = 0) => {
    const result = await query(
      `SELECT id, type, points, description, reference_type, reference_id, created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )
    return result.rows
  },

  /**
   * Obtener resumen de transacciones del usuario
   */
  getSummary: async (userId) => {
    const result = await query(
      `SELECT 
         SUM(CASE WHEN type = 'earned' THEN points ELSE 0 END) as total_earned,
         SUM(CASE WHEN type = 'redeemed' THEN points ELSE 0 END) as total_redeemed,
         COUNT(CASE WHEN type = 'earned' THEN 1 END) as transactions_earned,
         COUNT(CASE WHEN type = 'redeemed' THEN 1 END) as transactions_redeemed
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    )
    return result.rows[0]
  },

  /**
   * Obtener transacciones por rango de fechas
   */
  findByDateRange: async (userId, startDate, endDate) => {
    const result = await query(
      `SELECT id, type, points, description, reference_type, created_at
       FROM transactions
       WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
       ORDER BY created_at DESC`,
      [userId, startDate, endDate]
    )
    return result.rows
  }
}

export default TransactionModel
