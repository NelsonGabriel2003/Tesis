/**
 * Notificacion Model
 * Registro de notificaciones enviadas
 */

import { query } from '../config/database.js'

const NotificacionModel = {
  /**
   * Crear registro de notificacion
   */
  crear: async ({ usuario_id, personal_id, pedido_id, tipo, canal, titulo, mensaje }) => {
    const result = await query(
      `INSERT INTO notificaciones (usuario_id, personal_id, pedido_id, tipo, canal, titulo, mensaje, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'enviado')
       RETURNING *`,
      [usuario_id, personal_id, pedido_id, tipo, canal, titulo, mensaje]
    )
    return result.rows[0]
  },

  /**
   * Obtener notificaciones de un usuario
   */
  obtenerPorUsuario: async (usuarioId) => {
    const result = await query(
      `SELECT * FROM notificaciones WHERE usuario_id = $1 ORDER BY fecha_creacion DESC LIMIT 20`,
      [usuarioId]
    )
    return result.rows
  }
}

export default NotificacionModel
