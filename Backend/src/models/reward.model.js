/**
 * Reward Model
 * Consultas a la base de datos para recompensas canjeables
 */

import { query } from '../config/database.js'

const RewardModel = {
  /**
   * Obtener todas las recompensas disponibles
   */
  findAll: async (category = null) => {
    let sql = `
      SELECT id, name, description, points_cost, category, 
             image_url, stock, is_popular, is_available, created_at
      FROM rewards
      WHERE is_available = true AND stock > 0
    `
    const params = []

    if (category) {
      sql += ' AND category = $1'
      params.push(category)
    }

    sql += ' ORDER BY is_popular DESC, points_cost ASC'

    const result = await query(sql, params)
    return result.rows
  },

  /**
   * Buscar recompensa por ID
   */
  findById: async (id) => {
    const result = await query(
      'SELECT * FROM rewards WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  /**
   * Buscar recompensas por nombre
   */
  search: async (searchTerm) => {
    const result = await query(
      `SELECT id, name, description, points_cost, category, image_url, stock, is_popular
       FROM rewards
       WHERE is_available = true AND stock > 0
         AND (name ILIKE $1 OR description ILIKE $1)
       ORDER BY is_popular DESC, name`,
      [`%${searchTerm}%`]
    )
    return result.rows
  },

  /**
   * Reducir stock de recompensa
   */
  decreaseStock: async (id) => {
    const result = await query(
      `UPDATE rewards 
       SET stock = stock - 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND stock > 0
       RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Crear recompensa (admin)
   */
  create: async (rewardData) => {
    const { name, description, points_cost, category, image_url, stock, is_popular } = rewardData
    const result = await query(
      `INSERT INTO rewards (name, description, points_cost, category, image_url, stock, is_popular)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, points_cost, category, image_url, stock || 100, is_popular || false]
    )
    return result.rows[0]
  },

  /**
   * Actualizar recompensa (admin)
   */
  update: async (id, rewardData) => {
    const { name, description, points_cost, category, image_url, stock, is_popular, is_available } = rewardData
    const result = await query(
      `UPDATE rewards 
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           points_cost = COALESCE($4, points_cost),
           category = COALESCE($5, category),
           image_url = COALESCE($6, image_url),
           stock = COALESCE($7, stock),
           is_popular = COALESCE($8, is_popular),
           is_available = COALESCE($9, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, name, description, points_cost, category, image_url, stock, is_popular, is_available]
    )
    return result.rows[0]
  },

  /**
   * Obtener categorías de recompensas
   */
  getCategories: async () => {
    const result = await query(
      `SELECT DISTINCT category FROM rewards WHERE is_available = true ORDER BY category`
    )
    return result.rows.map(row => row.category)
  }
}

export default RewardModel
