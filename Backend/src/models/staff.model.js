import { query } from '../config/database.js'

const StaffModel = {
  findById: async (id) => {
    const result = await query(
      `SELECT * FROM staff WHERE id = $1`,
      [id]
    )
    return result.rows[0]
  },

  findByTelegramChatId: async (chatId) => {
    const result = await query(
      `SELECT * FROM staff WHERE telegram_chat_id = $1 AND is_active = true`,
      [chatId]
    )
    return result.rows[0]
  },

  findAll: async (onlyActive = true) => {
    const whereClause = onlyActive ? 'WHERE is_active = true' : ''
    const result = await query(
      `SELECT * FROM staff ${whereClause} ORDER BY name`
    )
    return result.rows
  },

  findOnShift: async () => {
    const result = await query(
      `SELECT * FROM staff 
       WHERE is_active = true AND is_on_shift = true AND telegram_chat_id IS NOT NULL`
    )
    return result.rows
  },

  create: async (staffData) => {
    const { name, phone, email, role } = staffData
    const result = await query(
      `INSERT INTO staff (name, phone, email, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, phone, email, role || 'waiter']
    )
    return result.rows[0]
  },

  linkTelegram: async (id, chatId, username) => {
    const result = await query(
      `UPDATE staff SET
        telegram_chat_id = $2,
        telegram_username = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, chatId, username]
    )
    return result.rows[0]
  },

  setShiftStatus: async (id, isOnShift) => {
    const result = await query(
      `UPDATE staff SET
        is_on_shift = $2,
        last_activity = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, isOnShift]
    )
    return result.rows[0]
  },

  updateLastActivity: async (id) => {
    await query(
      `UPDATE staff SET last_activity = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    )
  }
}

export default StaffModel