/**
 * Movimiento Model
 * Consultas a la base de datos para historial de movimientos de puntos
 */

import { query } from '../config/database.js'

const MovimientoModel = {
  /**
   * Crear movimiento de puntos
   * @param {Object} datosMovimiento
   * @param {number} datosMovimiento.usuario_id - ID del usuario
   * @param {string} datosMovimiento.tipo - 'ganado' | 'canjeado' | 'expirado' | 'bonus'
   * @param {number} datosMovimiento.puntos - Cantidad de puntos
   * @param {string} datosMovimiento.descripcion - Descripcion del movimiento
   * @param {string} datosMovimiento.tipo_referencia - 'pedido' | 'canje' | 'servicio' | 'promocion'
   * @param {number} datosMovimiento.referencia_id - ID del pedido/canje/etc
   */
  crear: async (datosMovimiento) => {
    const { usuario_id, tipo, puntos, descripcion, tipo_referencia, referencia_id } = datosMovimiento
    const result = await query(
      `INSERT INTO movimientos_puntos (usuario_id, tipo, puntos, descripcion, tipo_referencia, referencia_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [usuario_id, tipo, puntos, descripcion, tipo_referencia, referencia_id]
    )
    return result.rows[0]
  },

  /**
   * Obtener movimientos de un usuario
   */
  obtenerPorUsuario: async (usuarioId, limite = 20, offset = 0) => {
    const result = await query(
      `SELECT id, tipo, puntos, descripcion, tipo_referencia, referencia_id, fecha_movimiento
       FROM movimientos_puntos
       WHERE usuario_id = $1
       ORDER BY fecha_movimiento DESC
       LIMIT $2 OFFSET $3`,
      [usuarioId, limite, offset]
    )
    return result.rows
  },

  /**
   * Obtener resumen de movimientos del usuario
   */
  obtenerResumen: async (usuarioId) => {
    const result = await query(
      `SELECT
         SUM(CASE WHEN tipo = 'ganado' THEN puntos ELSE 0 END) as total_ganado,
         SUM(CASE WHEN tipo = 'canjeado' THEN puntos ELSE 0 END) as total_canjeado,
         COUNT(CASE WHEN tipo = 'ganado' THEN 1 END) as movimientos_ganados,
         COUNT(CASE WHEN tipo = 'canjeado' THEN 1 END) as movimientos_canjeados
       FROM movimientos_puntos
       WHERE usuario_id = $1`,
      [usuarioId]
    )
    return result.rows[0]
  },

  /**
   * Obtener movimientos por rango de fechas
   */
  obtenerPorFechas: async (usuarioId, fechaInicio, fechaFin) => {
    const result = await query(
      `SELECT id, tipo, puntos, descripcion, tipo_referencia, fecha_movimiento
       FROM movimientos_puntos
       WHERE usuario_id = $1 AND fecha_movimiento BETWEEN $2 AND $3
       ORDER BY fecha_movimiento DESC`,
      [usuarioId, fechaInicio, fechaFin]
    )
    return result.rows
  }
}

export default MovimientoModel
