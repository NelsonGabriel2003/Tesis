/**
 * Producto Model
 * Consultas a la base de datos para productos del menu
 */

import { query } from '../config/database.js'
import { conTransaccion, registrarHistorial, obtenerCamposModificados } from '../utils/transaccion.js'

const ProductoModel = {
  /**
   * Obtener todos los productos
   */
  obtenerTodos: async (categoria = null) => {
    let sql = `
      SELECT id, nombre, descripcion, precio, puntos_otorgados, categoria,
             imagen_url, disponible
      FROM productos
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
   * Buscar producto por ID
   */
  buscarPorId: async (id) => {
    const result = await query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  /**
   * Buscar productos por nombre
   */
  buscar: async (termino) => {
    const result = await query(
      `SELECT id, nombre, descripcion, precio, puntos_otorgados, categoria, imagen_url
       FROM productos
       WHERE disponible = true
         AND (nombre ILIKE $1 OR descripcion ILIKE $1)
       ORDER BY nombre`,
      [`%${termino}%`]
    )
    return result.rows
  },

  /**
   * Crear producto con registro en historial
   */
  crear: async (datosProducto, usuarioId = null, infoSolicitud = {}) => {
    const { nombre, descripcion, precio, puntos_otorgados, categoria, imagen_url } = datosProducto

    return await conTransaccion(async (cliente) => {
      const result = await cliente.query(
        `INSERT INTO productos (nombre, descripcion, precio, puntos_otorgados, categoria, imagen_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [nombre, descripcion, precio, puntos_otorgados, categoria, imagen_url]
      )

      const nuevoProducto = result.rows[0]

      await registrarHistorial(cliente, {
        tabla_afectada: 'productos',
        registro_id: nuevoProducto.id,
        accion: 'INSERTAR',
        valores_nuevos: datosProducto,
        usuario_id: usuarioId,
        direccion_ip: infoSolicitud.ip,
        agente_usuario: infoSolicitud.userAgent,
        descripcion: `Producto ${nombre} creado`
      })

      return nuevoProducto
    })
  },

  /**
   * Actualizar producto con registro en historial
   */
  actualizar: async (id, datosProducto, usuarioId = null, infoSolicitud = {}) => {
    const { nombre, descripcion, precio, puntos_otorgados, categoria, imagen_url, disponible } = datosProducto

    return await conTransaccion(async (cliente) => {
      // Obtener datos anteriores
      const anteriorResult = await cliente.query('SELECT * FROM productos WHERE id = $1', [id])
      const anterior = anteriorResult.rows[0]

      const result = await cliente.query(
        `UPDATE productos
         SET nombre = COALESCE($2, nombre),
             descripcion = COALESCE($3, descripcion),
             precio = COALESCE($4, precio),
             puntos_otorgados = COALESCE($5, puntos_otorgados),
             categoria = COALESCE($6, categoria),
             imagen_url = COALESCE($7, imagen_url),
             disponible = COALESCE($8, disponible)
         WHERE id = $1
         RETURNING *`,
        [id, nombre, descripcion, precio, puntos_otorgados, categoria, imagen_url, disponible]
      )

      const productoActualizado = result.rows[0]

      const camposModificados = obtenerCamposModificados(anterior, productoActualizado)
      if (camposModificados.length > 0) {
        await registrarHistorial(cliente, {
          tabla_afectada: 'productos',
          registro_id: id,
          accion: 'ACTUALIZAR',
          valores_anteriores: anterior,
          valores_nuevos: productoActualizado,
          campos_modificados: camposModificados,
          usuario_id: usuarioId,
          direccion_ip: infoSolicitud.ip,
          agente_usuario: infoSolicitud.userAgent,
          descripcion: `Producto ${productoActualizado.nombre} actualizado`
        })
      }

      return productoActualizado
    })
  },

  /**
   * Eliminar producto (soft delete) con registro en historial
   */
  eliminar: async (id, usuarioId = null, infoSolicitud = {}) => {
    return await conTransaccion(async (cliente) => {
      const anteriorResult = await cliente.query('SELECT * FROM productos WHERE id = $1', [id])
      const anterior = anteriorResult.rows[0]

      const result = await cliente.query(
        `UPDATE productos SET disponible = false WHERE id = $1 RETURNING id`,
        [id]
      )

      await registrarHistorial(cliente, {
        tabla_afectada: 'productos',
        registro_id: id,
        accion: 'ELIMINAR',
        valores_anteriores: anterior,
        usuario_id: usuarioId,
        direccion_ip: infoSolicitud.ip,
        agente_usuario: infoSolicitud.userAgent,
        descripcion: `Producto ${anterior.nombre} eliminado`
      })

      return result.rows[0]
    })
  },

  /**
   * Obtener categorias disponibles
   */
  obtenerCategorias: async () => {
    const result = await query(
      `SELECT DISTINCT categoria FROM productos WHERE disponible = true ORDER BY categoria`
    )
    return result.rows.map(row => row.categoria)
  }
}

export default ProductoModel
