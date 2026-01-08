const { query } = require('../config/database')

const TelegramSessionModel = {
  findByChatId: async (chatId) => {
    const result = await query(
      `SELECT ts.*, s.name as staff_name
       FROM telegram_sessions ts
       LEFT JOIN staff s ON ts.staff_id = s.id
       WHERE ts.chat_id = $1`,
      [chatId]
    )
    return result.rows[0]
  },

  create: async (sessionData) => {
    const { chatId, telegramUserId, username, firstName } = sessionData

    const result = await query(
      `INSERT INTO telegram_sessions (chat_id, telegram_user_id, username, first_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (chat_id) DO UPDATE SET
         username = $3,
         first_name = $4,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [chatId, telegramUserId, username, firstName]
    )
    return result.rows[0]
  },

  linkToStaff: async (chatId, staffId) => {
    const result = await query(
      `UPDATE telegram_sessions SET
        staff_id = $2,
        is_authenticated = true,
        updated_at = CURRENT_TIMESTAMP
       WHERE chat_id = $1
       RETURNING *`,
      [chatId, staffId]
    )
    return result.rows[0]
  },

  delete: async (chatId) => {
    await query(`DELETE FROM telegram_sessions WHERE chat_id = $1`, [chatId])
  }
}

module.exports = TelegramSessionModel