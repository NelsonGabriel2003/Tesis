/**
 * Historial Model
 * Modelo para registrar todos los cambios en el sistema (auditoria)
 */

import { query } from '../config/database.js'

const HistorialModel = {
  /**
   * Registrar un cambio en el historial
   * @param {Object} datos
   * @param {string} datos.tabla_afectada - Nombre de la tabla modificada
   * @param {number} datos.registro_id - ID del registro afectado
   * @param {string} datos.accion - INSERTAR, ACTUALIZAR, ELIMINAR
   * @param {Object} datos.valores_anteriores - Valores antes del cambio
   * @param {Object} datos.valores_nuevos - Valores despues del cambio
   * @param {Array} datos.campos_modificados - Lista de campos modificados
   * @param {number} datos.usuario_id - ID del usuario que realizo el cambio
   * @param {string} datos.direccion_ip - IP del cliente
   * @param {string} datos.agente_usuario - User agent del cliente
   * @param {string} datos.descripcion - Descripcion del cambio
   */
  registrar: async (datos) => {
    const {
      tabla_afectada,
      registro_id,
      accion,
      valores_anteriores = null,
      valores_nuevos = null,
      campos_modificados = null,
      usuario_id = null,
      direccion_ip = null,
      agente_usuario = null,
      descripcion = null
    } = datos

    const result = await query(
      `INSERT INTO historial
        (tabla_afectada, registro_id, accion, valores_anteriores, valores_nuevos,
         campos_modificados, usuario_id, direccion_ip, agente_usuario, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        tabla_afectada,
        registro_id,
        accion,
        valores_anteriores ? JSON.stringify(valores_anteriores) : null,
        valores_nuevos ? JSON.stringify(valores_nuevos) : null,
        campos_modificados ? campos_modificados.join(',') : null,
        usuario_id,
        direccion_ip,
        agente_usuario,
        descripcion
      ]
    )
    return result.rows[0]
  },

  /**
   * Obtener historial de una tabla especifica
   */
  obtenerPorTabla: async (tabla, limite = 50, offset = 0) => {
    const result = await query(
      `SELECT h.*, u.nombre as nombre_usuario
       FROM historial h
       LEFT JOIN usuarios u ON h.usuario_id = u.id
       WHERE h.tabla_afectada = $1
       ORDER BY h.fecha_creacion DESC
       LIMIT $2 OFFSET $3`,
      [tabla, limite, offset]
    )
    return result.rows
  },

  /**
   * Obtener historial de un registro especifico
   */
  obtenerPorRegistro: async (tabla, registroId) => {
    const result = await query(
      `SELECT h.*, u.nombre as nombre_usuario
       FROM historial h
       LEFT JOIN usuarios u ON h.usuario_id = u.id
       WHERE h.tabla_afectada = $1 AND h.registro_id = $2
       ORDER BY h.fecha_creacion DESC`,
      [tabla, registroId]
    )
    return result.rows
  },

  /**
   * Obtener historial de cambios realizados por un usuario
   */
  obtenerPorUsuario: async (usuarioId, limite = 50, offset = 0) => {
    const result = await query(
      `SELECT * FROM historial
       WHERE usuario_id = $1
       ORDER BY fecha_creacion DESC
       LIMIT $2 OFFSET $3`,
      [usuarioId, limite, offset]
    )
    return result.rows
  },

  /**
   * Obtener historial por rango de fechas
   */
  obtenerPorFechas: async (fechaInicio, fechaFin, limite = 100) => {
    const result = await query(
      `SELECT h.*, u.nombre as nombre_usuario
       FROM historial h
       LEFT JOIN usuarios u ON h.usuario_id = u.id
       WHERE h.fecha_creacion BETWEEN $1 AND $2
       ORDER BY h.fecha_creacion DESC
       LIMIT $3`,
      [fechaInicio, fechaFin, limite]
    )
    return result.rows
  },

  /**
   * Obtener historial reciente (para dashboard admin)
   */
  obtenerReciente: async (limite = 20) => {
    const result = await query(
      `SELECT h.*, u.nombre as nombre_usuario
       FROM historial h
       LEFT JOIN usuarios u ON h.usuario_id = u.id
       ORDER BY h.fecha_creacion DESC
       LIMIT $1`,
      [limite]
    )
    return result.rows
  },

  /**
   * Contar registros por tabla
   */
  contarPorTabla: async () => {
    const result = await query(
      `SELECT tabla_afectada, COUNT(*) as total
       FROM historial
       GROUP BY tabla_afectada
       ORDER BY total DESC`
    )
    return result.rows
  },

  /**
   * Buscar en el historial
   */
  buscar: async (termino, limite = 50) => {
    const result = await query(
      `SELECT h.*, u.nombre as nombre_usuario
       FROM historial h
       LEFT JOIN usuarios u ON h.usuario_id = u.id
       WHERE h.descripcion ILIKE $1
          OR h.tabla_afectada ILIKE $1
          OR h.accion ILIKE $1
       ORDER BY h.fecha_creacion DESC
       LIMIT $2`,
      [`%${termino}%`, limite]
    )
    return result.rows
  }
}

export default HistorialModel
