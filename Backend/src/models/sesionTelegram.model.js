/**
 * Sesion Telegram Model
 * Manejo de sesiones de Telegram para el personal
 */

import { query } from '../config/database.js'

const SesionTelegramModel = {
  /**
   * Buscar sesion por chat ID
   */
  buscarPorChatId: async (chatId) => {
    const result = await query(
      `SELECT st.*, p.nombre as nombre_personal
       FROM sesiones_telegram st
       LEFT JOIN personal p ON st.personal_id = p.id
       WHERE st.chat_id = $1`,
      [chatId]
    )
    return result.rows[0]
  },

  /**
   * Crear o actualizar sesion
   */
  crear: async (datosSesion) => {
    const { chatId, telegramUsuarioId, username, nombre } = datosSesion

    const result = await query(
      `INSERT INTO sesiones_telegram (chat_id, telegram_usuario_id, username, nombre)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (chat_id) DO UPDATE SET
         username = $3,
         nombre = $4
       RETURNING *`,
      [chatId, telegramUsuarioId, username, nombre]
    )
    return result.rows[0]
  },

  /**
   * Vincular sesion con personal
   */
  vincularConPersonal: async (chatId, personalId) => {
    const result = await query(
      `UPDATE sesiones_telegram SET
        personal_id = $2,
        autenticado = true
       WHERE chat_id = $1
       RETURNING *`,
      [chatId, personalId]
    )
    return result.rows[0]
  },

  /**
   * Eliminar sesion
   */
  eliminar: async (chatId) => {
    await query(`DELETE FROM sesiones_telegram WHERE chat_id = $1`, [chatId])
  }
}

export default SesionTelegramModel
