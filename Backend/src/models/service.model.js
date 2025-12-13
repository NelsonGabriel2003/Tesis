/**
 * Service Model
 * Consultas a la base de datos para servicios del bar
 */

const { query } = require('../config/database')

const ServiceModel = {
  /**
   * Obtener todos los servicios disponibles
   */
  findAll: async (category = null) => {
    let sql = `
      SELECT id, name, description, points_required, points_earned, 
             category, image_url, is_available, created_at
      FROM services
      WHERE is_available = true
    `
    const params = []

    if (category) {
      sql += ' AND category = $1'
      params.push(category)
    }

    sql += ' ORDER BY category, name'

    const result = await query(sql, params)
    return result.rows
  },

  /**
   * Buscar servicio por ID
   */
  findById: async (id) => {
    const result = await query(
      'SELECT * FROM services WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  /**
   * Crear servicio (admin)
   */
  create: async (serviceData) => {
    const { name, description, points_required, points_earned, category, image_url } = serviceData
    const result = await query(
      `INSERT INTO services (name, description, points_required, points_earned, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, points_required || 0, points_earned || 0, category, image_url]
    )
    return result.rows[0]
  },

  /**
   * Actualizar servicio (admin)
   */
  update: async (id, serviceData) => {
    const { name, description, points_required, points_earned, category, image_url, is_available } = serviceData
    const result = await query(
      `UPDATE services 
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           points_required = COALESCE($4, points_required),
           points_earned = COALESCE($5, points_earned),
           category = COALESCE($6, category),
           image_url = COALESCE($7, image_url),
           is_available = COALESCE($8, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, name, description, points_required, points_earned, category, image_url, is_available]
    )
    return result.rows[0]
  },

  /**
   * Obtener categorías de servicios
   */
  getCategories: async () => {
    const result = await query(
      `SELECT DISTINCT category FROM services WHERE is_available = true ORDER BY category`
    )
    return result.rows.map(row => row.category)
  }
}

module.exports = ServiceModel
