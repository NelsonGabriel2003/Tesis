import { query } from '../config/database.js'

/**
 * Genera un código aleatorio de 6 caracteres
 */
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

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

  findByLinkCode: async (code) => {
    const result = await query(
      `SELECT * FROM staff
       WHERE link_code = $1
       AND is_active = true
       AND (link_code_expires IS NULL OR link_code_expires > CURRENT_TIMESTAMP)`,
      [code.toUpperCase()]
    )
    return result.rows[0]
  },

  findAll: async (onlyActive = true) => {
    const whereClause = onlyActive ? 'WHERE is_active = true' : ''
    const result = await query(
      `SELECT id, name, phone, email, role, telegram_chat_id, telegram_username,
              is_active, is_on_shift, link_code, link_code_expires, created_at
       FROM staff ${whereClause} ORDER BY name`
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

  update: async (id, staffData) => {
    const { name, phone, email, role, is_active } = staffData
    const result = await query(
      `UPDATE staff SET
        name = COALESCE($2, name),
        phone = COALESCE($3, phone),
        email = COALESCE($4, email),
        role = COALESCE($5, role),
        is_active = COALESCE($6, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, name, phone, email, role, is_active]
    )
    return result.rows[0]
  },

  generateLinkCode: async (id) => {
    const code = generateCode()
    // El código expira en 24 horas
    const result = await query(
      `UPDATE staff SET
        link_code = $2,
        link_code_expires = CURRENT_TIMESTAMP + INTERVAL '24 hours',
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, code]
    )
    return result.rows[0]
  },

  clearLinkCode: async (id) => {
    const result = await query(
      `UPDATE staff SET
        link_code = NULL,
        link_code_expires = NULL,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  linkTelegram: async (id, chatId, username) => {
    const result = await query(
      `UPDATE staff SET
        telegram_chat_id = $2,
        telegram_username = $3,
        link_code = NULL,
        link_code_expires = NULL,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, chatId, username]
    )
    return result.rows[0]
  },

  unlinkTelegram: async (id) => {
    const result = await query(
      `UPDATE staff SET
        telegram_chat_id = NULL,
        telegram_username = NULL,
        is_on_shift = false,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
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
  },

  delete: async (id) => {
    const result = await query(
      `UPDATE staff SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    )
    return result.rows[0]
  }
}

export default StaffModel
