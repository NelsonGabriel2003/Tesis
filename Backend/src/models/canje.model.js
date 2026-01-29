/**
 * Canje Model
 * Consultas a la base de datos para canjes realizados
 */

import { query } from '../config/database.js'

const CanjeModel = {
  /**
   * Crear un nuevo canje
   */
  crear: async (datosCanje) => {
    const { usuario_id, recompensa_id, puntos_gastados, codigo_canje } = datosCanje
    const result = await query(
      `INSERT INTO canjes (usuario_id, recompensa_id, puntos_gastados, codigo_canje, estado)
       VALUES ($1, $2, $3, $4, 'pendiente')
       RETURNING *`,
      [usuario_id, recompensa_id, puntos_gastados, codigo_canje]
    )
    return result.rows[0]
  },

  /**
   * Obtener canje por ID
   */
  buscarPorId: async (id) => {
    const result = await query(
      `SELECT c.*, r.nombre as nombre_recompensa, r.descripcion as descripcion_recompensa
       FROM canjes c
       JOIN recompensas r ON c.recompensa_id = r.id
       WHERE c.id = $1`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Obtener canje por codigo
   */
  buscarPorCodigo: async (codigo) => {
    const result = await query(
      `SELECT c.*, r.nombre as nombre_recompensa, u.nombre as nombre_usuario
       FROM canjes c
       JOIN recompensas r ON c.recompensa_id = r.id
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.codigo_canje = $1`,
      [codigo]
    )
    return result.rows[0]
  },

  /**
   * Obtener canjes de un usuario
   */
  obtenerPorUsuario: async (usuarioId, limite = 20, offset = 0) => {
    const result = await query(
      `SELECT c.id, c.puntos_gastados, c.codigo_canje, c.estado, c.fecha_canje, c.fecha_uso,
              r.nombre as nombre_recompensa, r.categoria as categoria_recompensa
       FROM canjes c
       JOIN recompensas r ON c.recompensa_id = r.id
       WHERE c.usuario_id = $1
       ORDER BY c.fecha_canje DESC
       LIMIT $2 OFFSET $3`,
      [usuarioId, limite, offset]
    )
    return result.rows
  },

  /**
   * Marcar canje como usado
   */
  marcarComoUsado: async (id) => {
    const result = await query(
      `UPDATE canjes
       SET estado = 'usado', fecha_uso = CURRENT_TIMESTAMP
       WHERE id = $1 AND estado = 'pendiente'
       RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Marcar canje como usado por codigo
   */
  marcarComoUsadoPorCodigo: async (codigo) => {
    const result = await query(
      `UPDATE canjes
       SET estado = 'usado', fecha_uso = CURRENT_TIMESTAMP
       WHERE codigo_canje = $1 AND estado = 'pendiente'
       RETURNING *`,
      [codigo]
    )
    return result.rows[0]
  },

  /**
   * Cancelar canje
   */
  cancelar: async (id, usuarioId) => {
    const result = await query(
      `UPDATE canjes
       SET estado = 'cancelado'
       WHERE id = $1 AND usuario_id = $2 AND estado = 'pendiente'
       RETURNING *`,
      [id, usuarioId]
    )
    return result.rows[0]
  },

  /**
   * Obtener estadisticas de canjes del usuario
   */
  obtenerEstadisticas: async (usuarioId) => {
    const result = await query(
      `SELECT
         COUNT(*) as total_canjes,
         COUNT(CASE WHEN estado = 'usado' THEN 1 END) as usados,
         COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
         SUM(puntos_gastados) as total_puntos_canjeados
       FROM canjes
       WHERE usuario_id = $1`,
      [usuarioId]
    )
    return result.rows[0]
  },

  /**
   * Obtener canjes con resumen (para admin)
   */
  obtenerConResumen: async (usuarioId) => {
    const canjesResult = await query(
      `SELECT c.id, c.puntos_gastados, c.codigo_canje, c.estado, c.fecha_canje, c.fecha_uso,
              r.nombre as nombre_recompensa, r.categoria as categoria_recompensa
       FROM canjes c
       JOIN recompensas r ON c.recompensa_id = r.id
       WHERE c.usuario_id = $1
       ORDER BY c.fecha_canje DESC`,
      [usuarioId]
    )

    const resumenResult = await query(
      `SELECT
         COUNT(*) as total_canjes,
         COALESCE(SUM(puntos_gastados), 0) as puntos_canjeados
       FROM canjes
       WHERE usuario_id = $1`,
      [usuarioId]
    )

    return {
      canjes: canjesResult.rows,
      resumen: resumenResult.rows[0]
    }
  },

  /**
   * Contar canjes por usuario
   */
  contarPorUsuario: async (usuarioId) => {
    const result = await query(
      `SELECT COUNT(*) as total FROM canjes WHERE usuario_id = $1`,
      [usuarioId]
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener todos los canjes pendientes (para admin)
   */
  obtenerPendientes: async () => {
    const result = await query(
      `SELECT c.id, c.usuario_id, c.puntos_gastados, c.codigo_canje, c.estado, c.fecha_canje, c.fecha_uso,
              r.nombre as nombre_recompensa, r.categoria as categoria_recompensa,
              u.nombre as nombre_usuario, u.correo as correo_usuario
       FROM canjes c
       JOIN recompensas r ON c.recompensa_id = r.id
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.estado = 'pendiente'
       ORDER BY c.fecha_canje DESC`
    )
    return result.rows
  },

  /**
   * Obtener todos los canjes con filtro opcional (para admin)
   */
  obtenerTodosConUsuarios: async (estado = null, limite = 50) => {
    let queryText = `
      SELECT c.id, c.usuario_id, c.puntos_gastados, c.codigo_canje, c.estado, c.fecha_canje, c.fecha_uso,
             r.nombre as nombre_recompensa, r.categoria as categoria_recompensa,
             u.nombre as nombre_usuario, u.correo as correo_usuario
      FROM canjes c
      JOIN recompensas r ON c.recompensa_id = r.id
      JOIN usuarios u ON c.usuario_id = u.id
    `
    const params = []

    if (estado) {
      queryText += ` WHERE c.estado = $1`
      params.push(estado)
    }

    queryText += ` ORDER BY c.fecha_canje DESC LIMIT $${params.length + 1}`
    params.push(limite)

    const result = await query(queryText, params)
    return result.rows
  },

  /**
   * Obtener resumen de canjes para admin
   */
  obtenerResumenAdmin: async () => {
    const result = await query(
      `SELECT
         COUNT(*) as total,
         COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
         COUNT(CASE WHEN estado = 'usado' THEN 1 END) as usados,
         COALESCE(SUM(puntos_gastados), 0) as puntos_totales
       FROM canjes`
    )
    return result.rows[0]
  }
}

export default CanjeModel
