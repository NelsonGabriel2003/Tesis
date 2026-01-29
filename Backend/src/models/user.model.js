/**
 * User Model
 * Consultas a la base de datos para usuarios
 */

import { query } from '../config/database.js'

const UserModel = {
  /**
   * Buscar usuario por email
   */
  findByEmail: async (email) => {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0]
  },

  /**
   * Buscar usuario por ID
   */
  findById: async (id) => {
    const result = await query(
      `SELECT id, email, name, phone, role, membership_level,
              current_points, total_points, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Crear nuevo usuario
   */
  create: async (userData) => {
    const { email, password, name, phone } = userData
    const result = await query(
      `INSERT INTO users (email, password, name, phone, membership_level, current_points, total_points)
       VALUES ($1, $2, $3, $4, 'bronce', 0, 0)
       RETURNING id, email, name, phone, membership_level, current_points, total_points, created_at`,
      [email, password, name, phone]
    )
    return result.rows[0]
  },

  /**
   * Actualizar usuario
   */
  update: async (id, userData) => {
    const { name, phone } = userData
    const result = await query(
      `UPDATE users
       SET name = COALESCE($2, name),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, phone, role, membership_level, current_points, total_points`,
      [id, name, phone]
    )
    return result.rows[0]
  },

  /**
   * Actualizar puntos del usuario
   */
  updatePoints: async (id, currentPoints, totalPoints) => {
    const result = await query(
      `UPDATE users
       SET current_points = $2,
           total_points = $3,
           membership_level = CASE
             WHEN $3 >= 5000 THEN 'platino'
             WHEN $3 >= 1500 THEN 'oro'
             WHEN $3 >= 500 THEN 'plata'
             ELSE 'bronce'
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, role, membership_level, current_points, total_points`,
      [id, currentPoints, totalPoints]
    )
    return result.rows[0]
  },

  /**
   * Agregar puntos al usuario
   */
  addPoints: async (id, points) => {
    const result = await query(
      `UPDATE users
       SET current_points = current_points + $2,
           total_points = total_points + $2,
           membership_level = CASE
             WHEN total_points + $2 >= 5000 THEN 'platino'
             WHEN total_points + $2 >= 1500 THEN 'oro'
             WHEN total_points + $2 >= 500 THEN 'plata'
             ELSE 'bronce'
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, role, membership_level, current_points, total_points`,
      [id, points]
    )
    return result.rows[0]
  },

  /**
   * Restar puntos al usuario (para canjes)
   */
  subtractPoints: async (id, points) => {
    const result = await query(
      `UPDATE users
       SET current_points = current_points - $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND current_points >= $2
       RETURNING id, email, name, role, membership_level, current_points, total_points`,
      [id, points]
    )
    return result.rows[0]
  },

  /**
   * Obtener todos los usuarios (admin)
   */
  findAll: async (limit = 50, offset = 0) => {
    const result = await query(
      `SELECT id, email, name, phone, role, membership_level, current_points, total_points, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return result.rows
  },

  /**
   * Guardar código de recuperación de contraseña
   */
  guardarCodigoReset: async (email, codigo, minutosExpiracion = 15) => {
    const result = await query(
      `UPDATE users
       SET reset_code = $2,
           reset_code_expires = NOW() + INTERVAL '${minutosExpiracion} minutes'
       WHERE email = $1
       RETURNING id, email, name, phone, telegram_chat_id`,
      [email, codigo]
    )
    return result.rows[0]
  },

  /**
   * Verificar código de recuperación
   */
  verificarCodigoReset: async (email, codigo) => {
    const result = await query(
      `SELECT id, email, name
       FROM users
       WHERE email = $1
         AND reset_code = $2
         AND reset_code_expires > NOW()`,
      [email, codigo]
    )
    return result.rows[0]
  },

  /**
   * Cambiar contraseña y limpiar código de reset
   */
  cambiarPassword: async (email, nuevaPasswordHash) => {
    const result = await query(
      `UPDATE users
       SET password = $2,
           reset_code = NULL,
           reset_code_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE email = $1
       RETURNING id, email, name`,
      [email, nuevaPasswordHash]
    )
    return result.rows[0]
  },

  /**
   * Limpiar código de reset (después de usarlo o si expira)
   */
  limpiarCodigoReset: async (email) => {
    await query(
      `UPDATE users
       SET reset_code = NULL,
           reset_code_expires = NULL
       WHERE email = $1`,
      [email]
    )
  },

  /**
   * Vincular Telegram chat ID al usuario
   */
  vincularTelegram: async (userId, telegramChatId) => {
    const result = await query(
      `UPDATE users
       SET telegram_chat_id = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, telegram_chat_id`,
      [userId, telegramChatId]
    )
    return result.rows[0]
  },

  /**
   * Buscar usuario por Telegram chat ID
   */
  findByTelegramChatId: async (telegramChatId) => {
    const result = await query(
      `SELECT id, email, name, phone, telegram_chat_id
       FROM users
       WHERE telegram_chat_id = $1`,
      [telegramChatId]
    )
    return result.rows[0]
  }
}

export default UserModel
