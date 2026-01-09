/**
 * Product Model
 * Consultas a la base de datos para productos del menú
 */

import { query } from '../config/database.js'

const ProductModel = {
  /**
   * Obtener todos los productos
   */
  findAll: async (category = null) => {
    let sql = `
      SELECT id, name, description, price, points_earned, category, 
             image_url, is_available, created_at
      FROM products
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
   * Buscar producto por ID
   */
  findById: async (id) => {
    const result = await query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  /**
   * Buscar productos por nombre
   */
  search: async (searchTerm) => {
    const result = await query(
      `SELECT id, name, description, price, points_earned, category, image_url
       FROM products
       WHERE is_available = true
         AND (name ILIKE $1 OR description ILIKE $1)
       ORDER BY name`,
      [`%${searchTerm}%`]
    )
    return result.rows
  },

  /**
   * Crear producto (admin)
   */
  create: async (productData) => {
    const { name, description, price, points_earned, category, image_url } = productData
    const result = await query(
      `INSERT INTO products (name, description, price, points_earned, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, price, points_earned, category, image_url]
    )
    return result.rows[0]
  },

  /**
   * Actualizar producto (admin)
   */
  update: async (id, productData) => {
    const { name, description, price, points_earned, category, image_url, is_available } = productData
    const result = await query(
      `UPDATE products 
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           points_earned = COALESCE($5, points_earned),
           category = COALESCE($6, category),
           image_url = COALESCE($7, image_url),
           is_available = COALESCE($8, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, name, description, price, points_earned, category, image_url, is_available]
    )
    return result.rows[0]
  },

  /**
   * Eliminar producto (soft delete)
   */
  delete: async (id) => {
    const result = await query(
      `UPDATE products SET is_available = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Obtener categorías disponibles
   */
  getCategories: async () => {
    const result = await query(
      `SELECT DISTINCT category FROM products WHERE is_available = true ORDER BY category`
    )
    return result.rows.map(row => row.category)
  }
}

export default ProductModel
