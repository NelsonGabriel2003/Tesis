/**
 * Recompensa Model
 * Consultas a la base de datos para recompensas canjeables
 */

import { query } from '../config/database.js'
import { conTransaccion, registrarHistorial, obtenerCamposModificados } from '../utils/transaccion.js'

const RecompensaModel = {
  /**
   * Obtener todas las recompensas disponibles
   */
  obtenerTodas: async (categoria = null) => {
    let sql = `
      SELECT id, nombre, descripcion, puntos_requeridos, categoria,
             imagen_url, stock, es_popular, disponible
      FROM recompensas
      WHERE disponible = true AND stock > 0
    `
    const params = []

    if (categoria) {
      sql += ' AND LOWER(categoria) = LOWER($1)'
      params.push(categoria)
    }

    sql += ' ORDER BY es_popular DESC, puntos_requeridos ASC'

    const result = await query(sql, params)
    return result.rows
  },

  /**
   * Buscar recompensa por ID
   */
  buscarPorId: async (id) => {
    const result = await query(
      'SELECT * FROM recompensas WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  /**
   * Buscar recompensas por nombre
   */
  buscar: async (termino) => {
    const result = await query(
      `SELECT id, nombre, descripcion, puntos_requeridos, categoria, imagen_url, stock, es_popular
       FROM recompensas
       WHERE disponible = true AND stock > 0
         AND (nombre ILIKE $1 OR descripcion ILIKE $1)
       ORDER BY es_popular DESC, nombre`,
      [`%${termino}%`]
    )
    return result.rows
  },

  /**
   * Reducir stock de recompensa
   */
  reducirStock: async (id) => {
    const result = await query(
      `UPDATE recompensas
       SET stock = stock - 1
       WHERE id = $1 AND stock > 0
       RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Crear recompensa con registro en historial
   */
  crear: async (datosRecompensa, usuarioId = null, infoSolicitud = {}) => {
    const { nombre, descripcion, puntos_requeridos, categoria, imagen_url, stock, es_popular } = datosRecompensa

    return await conTransaccion(async (cliente) => {
      const result = await cliente.query(
        `INSERT INTO recompensas (nombre, descripcion, puntos_requeridos, categoria, imagen_url, stock, es_popular)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [nombre, descripcion, puntos_requeridos, categoria, imagen_url, stock || 100, es_popular || false]
      )

      const nuevaRecompensa = result.rows[0]

      await registrarHistorial(cliente, {
        tabla_afectada: 'recompensas',
        registro_id: nuevaRecompensa.id,
        accion: 'INSERTAR',
        valores_nuevos: datosRecompensa,
        usuario_id: usuarioId,
        direccion_ip: infoSolicitud.ip,
        agente_usuario: infoSolicitud.userAgent,
        descripcion: `Recompensa ${nombre} creada`
      })

      return nuevaRecompensa
    })
  },

  /**
   * Actualizar recompensa con registro en historial
   */
  actualizar: async (id, datosRecompensa, usuarioId = null, infoSolicitud = {}) => {
    const { nombre, descripcion, puntos_requeridos, categoria, imagen_url, stock, es_popular, disponible } = datosRecompensa

    return await conTransaccion(async (cliente) => {
      const anteriorResult = await cliente.query('SELECT * FROM recompensas WHERE id = $1', [id])
      const anterior = anteriorResult.rows[0]

      const result = await cliente.query(
        `UPDATE recompensas
         SET nombre = COALESCE($2, nombre),
             descripcion = COALESCE($3, descripcion),
             puntos_requeridos = COALESCE($4, puntos_requeridos),
             categoria = COALESCE($5, categoria),
             imagen_url = COALESCE($6, imagen_url),
             stock = COALESCE($7, stock),
             es_popular = COALESCE($8, es_popular),
             disponible = COALESCE($9, disponible)
         WHERE id = $1
         RETURNING *`,
        [id, nombre, descripcion, puntos_requeridos, categoria, imagen_url, stock, es_popular, disponible]
      )

      const recompensaActualizada = result.rows[0]

      const camposModificados = obtenerCamposModificados(anterior, recompensaActualizada)
      if (camposModificados.length > 0) {
        await registrarHistorial(cliente, {
          tabla_afectada: 'recompensas',
          registro_id: id,
          accion: 'ACTUALIZAR',
          valores_anteriores: anterior,
          valores_nuevos: recompensaActualizada,
          campos_modificados: camposModificados,
          usuario_id: usuarioId,
          direccion_ip: infoSolicitud.ip,
          agente_usuario: infoSolicitud.userAgent,
          descripcion: `Recompensa ${recompensaActualizada.nombre} actualizada`
        })
      }

      return recompensaActualizada
    })
  },

  /**
   * Obtener categorias de recompensas
   */
  obtenerCategorias: async () => {
    const result = await query(
      `SELECT DISTINCT categoria FROM recompensas WHERE disponible = true ORDER BY categoria`
    )
    return result.rows.map(row => row.categoria)
  }
}

export default RecompensaModel
