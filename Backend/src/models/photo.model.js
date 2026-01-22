/**
 * Photo Model
 * Consultas a la base de datos para fotos/eventos
 */

import { query } from '../config/database.js'

const PhotoModel = {
  /**
   * Obtener todas las fotos activas
   */
  findAll: async () => {
    const result = await query(
      `SELECT id, title, description, image_url, cloudinary_public_id
       FROM photos
       WHERE is_active = true
       ORDER BY id DESC`
    )
    return result.rows
  },

  /**
   * Obtener todas las fotos (incluidas inactivas) - Admin
   */
  findAllAdmin: async () => {
    const result = await query(
      `SELECT id, title, description, image_url, cloudinary_public_id, is_active
       FROM photos
       ORDER BY id DESC`
    )
    return result.rows
  },

  /**
   * Buscar foto por ID
   */
  findById: async (id) => {
    const result = await query(
      'SELECT * FROM photos WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  /**
   * Crear foto (admin)
   */
  create: async (photoData) => {
    const { title, description, image_url, cloudinary_public_id } = photoData
    const result = await query(
      `INSERT INTO photos (title, description, image_url, cloudinary_public_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, image_url, cloudinary_public_id]
    )
    return result.rows[0]
  },

  /**
   * Actualizar foto (admin)
   */
  update: async (id, photoData) => {
    const { title, description, image_url, cloudinary_public_id, is_active } = photoData
    const result = await query(
      `UPDATE photos
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           image_url = COALESCE($4, image_url),
           cloudinary_public_id = COALESCE($5, cloudinary_public_id),
           is_active = COALESCE($6, is_active)
       WHERE id = $1
       RETURNING *`,
      [id, title, description, image_url, cloudinary_public_id, is_active]
    )
    return result.rows[0]
  },

  /**
   * Eliminar foto (elimina completamente)
   */
  delete: async (id) => {
    const result = await query(
      'DELETE FROM photos WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  }
}

export default PhotoModel
