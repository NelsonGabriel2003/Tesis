import { query } from '../config/database.js'

const OrderModel = {
  create: async (orderData) => {
    const { 
      userId, orderCode, subtotal, discount, total, 
      pointsToEarn, tableNumber, notes, qrCodeData 
    } = orderData

    const result = await query(
      `INSERT INTO orders 
        (user_id, order_code, subtotal, discount, total, points_to_earn, table_number, notes, qr_code_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, orderCode, subtotal, discount || 0, total, pointsToEarn, tableNumber, notes, qrCodeData]
    )
    return result.rows[0]
  },

  findById: async (id) => {
    const result = await query(
      `SELECT o.*, 
              u.name as user_name, u.email as user_email, u.phone as user_phone,
              s.name as staff_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN staff s ON o.staff_id = s.id
       WHERE o.id = $1`,
      [id]
    )
    return result.rows[0]
  },

  findByCode: async (orderCode) => {
    const result = await query(
      `SELECT o.*, u.name as user_name, s.name as staff_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN staff s ON o.staff_id = s.id
       WHERE o.order_code = $1`,
      [orderCode]
    )
    return result.rows[0]
  },

  findByUserId: async (userId, limit = 20, offset = 0) => {
    const result = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )
    return result.rows
  },

  findActiveByUserId: async (userId) => {
    const result = await query(
      `SELECT * FROM orders 
       WHERE user_id = $1 AND status NOT IN ('delivered', 'rejected', 'cancelled')
       ORDER BY created_at DESC`,
      [userId]
    )
    return result.rows
  },

  findPending: async () => {
    const result = await query(
      `SELECT o.*, u.name as user_name, u.phone as user_phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.status = 'pending'
       ORDER BY o.created_at ASC`
    )
    return result.rows
  },

  updateStatus: async (id, status, staffId = null, additionalData = {}) => {
    const timestampField = {
      approved: 'approved_at',
      preparing: 'preparing_at',
      completed: 'completed_at',
      delivered: 'delivered_at'
    }[status]

    let setClause = `status = $2, updated_at = CURRENT_TIMESTAMP`
    let params = [id, status]
    let paramIndex = 3

    if (staffId) {
      setClause += `, staff_id = $${paramIndex++}`
      params.push(staffId)
    }

    if (timestampField) {
      setClause += `, ${timestampField} = CURRENT_TIMESTAMP`
    }

    if (additionalData.rejectionReason) {
      setClause += `, rejection_reason = $${paramIndex++}`
      params.push(additionalData.rejectionReason)
    }

    if (additionalData.pointsEarned !== undefined) {
      setClause += `, points_earned = $${paramIndex++}`
      params.push(additionalData.pointsEarned)
    }

    const result = await query(
      `UPDATE orders SET ${setClause} WHERE id = $1 RETURNING *`,
      params
    )
    return result.rows[0]
  },

  setTelegramMessageId: async (id, messageId) => {
    await query(
      `UPDATE orders SET telegram_message_id = $2 WHERE id = $1`,
      [id, messageId]
    )
  },

  countByUserAndStatus: async (userId, statuses) => {
    const result = await query(
      `SELECT COUNT(*) as count FROM orders WHERE user_id = $1 AND status = ANY($2)`,
      [userId, statuses]
    )
    return parseInt(result.rows[0].count)
  }
}

export default OrderModel