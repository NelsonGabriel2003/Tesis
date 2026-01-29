/**
 * Foto Model
 * Consultas a la base de datos para fotos/eventos
 */

import { query } from '../config/database.js'
import { conTransaccion, registrarHistorial } from '../utils/transaccion.js'

const FotoModel = {
  /**
   * Obtener todas las fotos activas
   */
  obtenerTodas: async () => {
    const result = await query(
      `SELECT id, titulo, descripcion, imagen_url, cloudinary_public_id
       FROM fotos
       WHERE activo = true
       ORDER BY id DESC`
    )
    return result.rows
  },

  /**
   * Obtener todas las fotos (incluidas inactivas) - Admin
   */
  obtenerTodasAdmin: async () => {
    const result = await query(
      `SELECT id, titulo, descripcion, imagen_url, cloudinary_public_id, activo
       FROM fotos
       ORDER BY id DESC`
    )
    return result.rows
  },

  /**
   * Buscar foto por ID
   */
  buscarPorId: async (id) => {
    const result = await query(
      'SELECT * FROM fotos WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  /**
   * Crear foto con registro en historial
   */
  crear: async (datosFoto, usuarioId = null, infoSolicitud = {}) => {
    const { titulo, descripcion, imagen_url, cloudinary_public_id } = datosFoto

    return await conTransaccion(async (cliente) => {
      const result = await cliente.query(
        `INSERT INTO fotos (titulo, descripcion, imagen_url, cloudinary_public_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [titulo, descripcion, imagen_url, cloudinary_public_id]
      )

      const nuevaFoto = result.rows[0]

      await registrarHistorial(cliente, {
        tabla_afectada: 'fotos',
        registro_id: nuevaFoto.id,
        accion: 'INSERTAR',
        valores_nuevos: datosFoto,
        usuario_id: usuarioId,
        direccion_ip: infoSolicitud.ip,
        agente_usuario: infoSolicitud.userAgent,
        descripcion: `Foto ${titulo} subida`
      })

      return nuevaFoto
    })
  },

  /**
   * Actualizar foto con registro en historial
   */
  actualizar: async (id, datosFoto, usuarioId = null, infoSolicitud = {}) => {
    const { titulo, descripcion, imagen_url, cloudinary_public_id, activo } = datosFoto

    return await conTransaccion(async (cliente) => {
      const anteriorResult = await cliente.query('SELECT * FROM fotos WHERE id = $1', [id])
      const anterior = anteriorResult.rows[0]

      const result = await cliente.query(
        `UPDATE fotos
         SET titulo = COALESCE($2, titulo),
             descripcion = COALESCE($3, descripcion),
             imagen_url = COALESCE($4, imagen_url),
             cloudinary_public_id = COALESCE($5, cloudinary_public_id),
             activo = COALESCE($6, activo)
         WHERE id = $1
         RETURNING *`,
        [id, titulo, descripcion, imagen_url, cloudinary_public_id, activo]
      )

      const fotoActualizada = result.rows[0]

      await registrarHistorial(cliente, {
        tabla_afectada: 'fotos',
        registro_id: id,
        accion: 'ACTUALIZAR',
        valores_anteriores: anterior,
        valores_nuevos: fotoActualizada,
        usuario_id: usuarioId,
        direccion_ip: infoSolicitud.ip,
        agente_usuario: infoSolicitud.userAgent,
        descripcion: `Foto ${fotoActualizada.titulo} actualizada`
      })

      return fotoActualizada
    })
  },

  /**
   * Eliminar foto con registro en historial
   */
  eliminar: async (id, usuarioId = null, infoSolicitud = {}) => {
    return await conTransaccion(async (cliente) => {
      const anteriorResult = await cliente.query('SELECT * FROM fotos WHERE id = $1', [id])
      const anterior = anteriorResult.rows[0]

      const result = await cliente.query(
        'DELETE FROM fotos WHERE id = $1 RETURNING *',
        [id]
      )

      await registrarHistorial(cliente, {
        tabla_afectada: 'fotos',
        registro_id: id,
        accion: 'ELIMINAR',
        valores_anteriores: anterior,
        usuario_id: usuarioId,
        direccion_ip: infoSolicitud.ip,
        agente_usuario: infoSolicitud.userAgent,
        descripcion: `Foto ${anterior.titulo} eliminada`
      })

      return result.rows[0]
    })
  }
}

export default FotoModel
