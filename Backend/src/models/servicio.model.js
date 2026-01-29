/**
 * Servicio Model
 * Consultas a la base de datos para servicios del bar
 */

import { query } from '../config/database.js'
import { conTransaccion, registrarHistorial, obtenerCamposModificados } from '../utils/transaccion.js'

const ServicioModel = {
  /**
   * Obtener todos los servicios disponibles
   */
  obtenerTodos: async (categoria = null) => {
    let sql = `
      SELECT id, nombre, descripcion, puntos_requeridos, puntos_otorgados,
             categoria, imagen_url, disponible
      FROM servicios
      WHERE disponible = true
    `
    const params = []

    if (categoria) {
      sql += ' AND LOWER(categoria) = LOWER($1)'
      params.push(categoria)
    }

    sql += ' ORDER BY categoria, nombre'

    const result = await query(sql, params)
    return result.rows
  },

  /**
   * Buscar servicio por ID
   */
  buscarPorId: async (id) => {
    const result = await query(
      'SELECT * FROM servicios WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  /**
   * Buscar servicios por nombre o descripcion
   */
  buscar: async (termino) => {
    const result = await query(
      `SELECT id, nombre, descripcion, puntos_requeridos, puntos_otorgados, categoria, imagen_url
       FROM servicios
       WHERE disponible = true
         AND (nombre ILIKE $1 OR descripcion ILIKE $1)
       ORDER BY nombre`,
      [`%${termino}%`]
    )
    return result.rows
  },

  /**
   * Crear servicio con registro en historial
   */
  crear: async (datosServicio, usuarioId = null, infoSolicitud = {}) => {
    const { nombre, descripcion, puntos_requeridos, puntos_otorgados, categoria, imagen_url } = datosServicio

    return await conTransaccion(async (cliente) => {
      const result = await cliente.query(
        `INSERT INTO servicios (nombre, descripcion, puntos_requeridos, puntos_otorgados, categoria, imagen_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [nombre, descripcion, puntos_requeridos || 0, puntos_otorgados || 0, categoria, imagen_url]
      )

      const nuevoServicio = result.rows[0]

      await registrarHistorial(cliente, {
        tabla_afectada: 'servicios',
        registro_id: nuevoServicio.id,
        accion: 'INSERTAR',
        valores_nuevos: datosServicio,
        usuario_id: usuarioId,
        direccion_ip: infoSolicitud.ip,
        agente_usuario: infoSolicitud.userAgent,
        descripcion: `Servicio ${nombre} creado`
      })

      return nuevoServicio
    })
  },

  /**
   * Actualizar servicio con registro en historial
   */
  actualizar: async (id, datosServicio, usuarioId = null, infoSolicitud = {}) => {
    const { nombre, descripcion, puntos_requeridos, puntos_otorgados, categoria, imagen_url, disponible } = datosServicio

    return await conTransaccion(async (cliente) => {
      const anteriorResult = await cliente.query('SELECT * FROM servicios WHERE id = $1', [id])
      const anterior = anteriorResult.rows[0]

      const result = await cliente.query(
        `UPDATE servicios
         SET nombre = COALESCE($2, nombre),
             descripcion = COALESCE($3, descripcion),
             puntos_requeridos = COALESCE($4, puntos_requeridos),
             puntos_otorgados = COALESCE($5, puntos_otorgados),
             categoria = COALESCE($6, categoria),
             imagen_url = COALESCE($7, imagen_url),
             disponible = COALESCE($8, disponible)
         WHERE id = $1
         RETURNING *`,
        [id, nombre, descripcion, puntos_requeridos, puntos_otorgados, categoria, imagen_url, disponible]
      )

      const servicioActualizado = result.rows[0]

      const camposModificados = obtenerCamposModificados(anterior, servicioActualizado)
      if (camposModificados.length > 0) {
        await registrarHistorial(cliente, {
          tabla_afectada: 'servicios',
          registro_id: id,
          accion: 'ACTUALIZAR',
          valores_anteriores: anterior,
          valores_nuevos: servicioActualizado,
          campos_modificados: camposModificados,
          usuario_id: usuarioId,
          direccion_ip: infoSolicitud.ip,
          agente_usuario: infoSolicitud.userAgent,
          descripcion: `Servicio ${servicioActualizado.nombre} actualizado`
        })
      }

      return servicioActualizado
    })
  },

  /**
   * Obtener categorias de servicios
   */
  obtenerCategorias: async () => {
    const result = await query(
      `SELECT DISTINCT categoria FROM servicios WHERE disponible = true ORDER BY categoria`
    )
    return result.rows.map(row => row.categoria)
  }
}

export default ServicioModel
