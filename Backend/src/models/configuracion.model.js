/**
 * Configuracion Model
 * Consultas a la base de datos para configuracion del negocio
 */

import { query } from '../config/database.js'
import { conTransaccion, registrarHistorial } from '../utils/transaccion.js'

const ConfiguracionModel = {
  /**
   * Obtener valor de una configuracion
   */
  obtener: async (clave) => {
    const result = await query(
      `SELECT valor FROM configuracion_negocio WHERE clave = $1`,
      [clave]
    )
    return result.rows[0]?.valor
  },

  /**
   * Obtener todas las configuraciones
   */
  obtenerTodas: async () => {
    const result = await query(
      `SELECT clave, valor, descripcion, categoria
       FROM configuracion_negocio
       ORDER BY categoria, clave`
    )
    return result.rows
  },

  /**
   * Obtener configuraciones por categoria
   */
  obtenerPorCategoria: async (categoria) => {
    const result = await query(
      `SELECT clave, valor, descripcion
       FROM configuracion_negocio
       WHERE categoria = $1
       ORDER BY clave`,
      [categoria]
    )
    return result.rows
  },

  /**
   * Establecer valor de configuracion con registro en historial
   */
  establecer: async (clave, valor, usuarioId = null, infoSolicitud = {}) => {
    return await conTransaccion(async (cliente) => {
      // Obtener valor anterior
      const anteriorResult = await cliente.query(
        `SELECT valor FROM configuracion_negocio WHERE clave = $1`,
        [clave]
      )
      const valorAnterior = anteriorResult.rows[0]?.valor

      // Actualizar o insertar
      const result = await cliente.query(
        `INSERT INTO configuracion_negocio (clave, valor)
         VALUES ($1, $2)
         ON CONFLICT (clave) DO UPDATE SET valor = $2
         RETURNING *`,
        [clave, valor]
      )

      const configuracion = result.rows[0]

      // Registrar en historial si cambio el valor
      if (valorAnterior !== valor) {
        await registrarHistorial(cliente, {
          tabla_afectada: 'configuracion_negocio',
          registro_id: configuracion.id,
          accion: valorAnterior ? 'ACTUALIZAR' : 'INSERTAR',
          valores_anteriores: valorAnterior ? { [clave]: valorAnterior } : null,
          valores_nuevos: { [clave]: valor },
          campos_modificados: ['valor'],
          usuario_id: usuarioId,
          direccion_ip: infoSolicitud.ip,
          agente_usuario: infoSolicitud.userAgent,
          descripcion: `Configuracion ${clave} actualizada de ${valorAnterior} a ${valor}`
        })
      }

      return configuracion
    })
  }
}

export default ConfiguracionModel
