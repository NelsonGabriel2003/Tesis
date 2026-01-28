/**
 * Notification Model
 * Registro de notificaciones enviadas
 */

import { query } from '../config/database.js'

const NotificationModel = {
  /**
   * Crear registro de notificación
   */
  create: async ({ user_id, staff_id, order_id, type, channel, title, message }) => {
    const result = await query(
      `INSERT INTO notifications (user_id, staff_id, order_id, type, channel, title, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent')
       RETURNING *`,
      [user_id, staff_id, order_id, type, channel, title, message]
    )
    return result.rows[0]
  },

  /**
   * Obtener notificaciones de un usuario
   */
  findByUser: async (userId) => {
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [userId]
    )
    return result.rows
  }
}

export default NotificationModel
