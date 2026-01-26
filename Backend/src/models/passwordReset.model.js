/**
 * Password Reset Model
 * Consultas para recuperación de contraseñas
 */

import { query } from '../config/database.js'

const PasswordResetModel = {
  /**
   * Crear nuevo código de recuperación
   */
  create: async ({ userId, email, code, expiresAt }) => {
    // Primero invalidamos códigos anteriores del mismo email
    await query(
      `UPDATE password_resets SET used = true WHERE email = $1 AND used = false`,
      [email]
    )

    // Crear nuevo código
    const result = await query(
      `INSERT INTO password_resets (user_id, email, code, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, code, expires_at, created_at`,
      [userId, email, code, expiresAt]
    )
    return result.rows[0]
  },

  /**
   * Buscar código válido por email y código
   */
  findValidCode: async (email, code) => {
    const result = await query(
      `SELECT pr.*, u.name as user_name
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.email = $1
         AND pr.code = $2
         AND pr.used = false
         AND pr.expires_at > NOW()
       ORDER BY pr.created_at DESC
       LIMIT 1`,
      [email, code]
    )
    return result.rows[0]
  },

  /**
   * Marcar código como usado
   */
  markAsUsed: async (id) => {
    const result = await query(
      `UPDATE password_resets SET used = true WHERE id = $1 RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Verificar si hay un código pendiente reciente (para evitar spam)
   */
  hasRecentCode: async (email, minutes = 1) => {
    const result = await query(
      `SELECT id FROM password_resets
       WHERE email = $1
         AND created_at > NOW() - INTERVAL '${minutes} minutes'
       LIMIT 1`,
      [email]
    )
    return result.rows.length > 0
  },

  /**
   * Limpiar códigos expirados (para mantenimiento)
   */
  cleanExpired: async () => {
    const result = await query(
      `DELETE FROM password_resets
       WHERE expires_at < NOW() OR used = true
       RETURNING id`
    )
    return result.rowCount
  }
}

export default PasswordResetModel
