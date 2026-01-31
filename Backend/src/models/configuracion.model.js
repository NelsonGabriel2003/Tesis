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
   * Buscar configuración por clave (retorna objeto completo)
   */
  buscarPorClave: async (clave) => {
    const result = await query(
      `SELECT id, clave, valor, descripcion, categoria 
       FROM configuracion_negocio WHERE clave = $1`,
      [clave]
    )
    return result.rows[0]
  },

  /**
   * Obtener todas las configuraciones
   */
  obtenerTodas: async () => {
    const result = await query(
      `SELECT id, clave, valor, descripcion, categoria
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
      `SELECT id, clave, valor, descripcion
       FROM configuracion_negocio
       WHERE categoria = $1
       ORDER BY clave`,
      [categoria]
    )
    return result.rows
  },

  /**
   * Obtener configuración de puntos
   */
  obtenerConfigPuntos: async () => {
    const result = await query(
      `SELECT clave, valor FROM configuracion_negocio WHERE categoria = 'puntos'`
    )
    
    const config = {}
    result.rows.forEach(row => {
      config[row.clave] = row.valor
    })
    
    return {
      pointsPerDollar: parseFloat(config.puntos_por_dolar) || 1
    }
  },

  /**
   * Obtener configuración de membresías (para el frontend y cálculos)
   */
  obtenerConfigMembresia: async () => {
    const result = await query(
      `SELECT clave, valor FROM configuracion_negocio WHERE categoria = 'membresia'`
    )
    
    const config = {}
    result.rows.forEach(row => {
      config[row.clave] = row.valor
    })
    
    return {
      levels: {
        bronce: {
          name: 'Bronce',
          displayName: 'Bronce',
          minPoints: 0,
          multiplier: 1,
          icon: config.icon_bronce || '🥉',
          color: config.color_bronce || 'bg-amber-600'
        },
        plata: {
          name: 'Plata',
          displayName: 'Plata',
          minPoints: parseInt(config.umbral_plata) || 500,
          multiplier: parseFloat(config.multiplicador_plata) || 1.5,
          icon: config.icon_plata || '🥈',
          color: config.color_plata || 'bg-gray-400'
        },
        oro: {
          name: 'Oro',
          displayName: 'Oro',
          minPoints: parseInt(config.umbral_oro) || 1500,
          multiplier: parseFloat(config.multiplicador_oro) || 2,
          icon: config.icon_oro || '🥇',
          color: config.color_oro || 'bg-yellow-500'
        },
        platino: {
          name: 'Platino',
          displayName: 'Platino',
          minPoints: parseInt(config.umbral_platino) || 5000,
          multiplier: parseFloat(config.multiplicador_platino) || 3,
          icon: config.icon_platino || '💎',
          color: config.color_platino || 'bg-purple-500'
        }
      },
      // Array ordenado para cálculos
      levelsArray: [
        { name: 'bronce', minPoints: 0 },
        { name: 'plata', minPoints: parseInt(config.umbral_plata) || 500 },
        { name: 'oro', minPoints: parseInt(config.umbral_oro) || 1500 },
        { name: 'platino', minPoints: parseInt(config.umbral_platino) || 5000 }
      ]
    }
  },

  /**
   * Obtener solo los umbrales de membresía (para usuario.model.js)
   */
  obtenerUmbrales: async () => {
    const result = await query(
      `SELECT clave, valor FROM configuracion_negocio 
       WHERE clave IN ('umbral_plata', 'umbral_oro', 'umbral_platino')`
    )
    
    const umbrales = {
      plata: 500,
      oro: 1500,
      platino: 5000
    }
    
    result.rows.forEach(row => {
      if (row.clave === 'umbral_plata') umbrales.plata = parseInt(row.valor)
      if (row.clave === 'umbral_oro') umbrales.oro = parseInt(row.valor)
      if (row.clave === 'umbral_platino') umbrales.platino = parseInt(row.valor)
    })
    
    return umbrales
  },

  /**
   * Crear nueva configuración
   */
  crear: async (datos, usuarioId = null, infoSolicitud = {}) => {
    const { clave, valor, descripcion, categoria } = datos

    return await conTransaccion(async (cliente) => {
      const result = await cliente.query(
        `INSERT INTO configuracion_negocio (clave, valor, descripcion, categoria)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [clave, valor, descripcion, categoria || 'general']
      )

      const configuracion = result.rows[0]

      await registrarHistorial(cliente, {
        tabla_afectada: 'configuracion_negocio',
        registro_id: configuracion.id,
        accion: 'INSERTAR',
        valores_anteriores: null,
        valores_nuevos: { clave, valor, descripcion, categoria },
        usuario_id: usuarioId,
        direccion_ip: infoSolicitud.ip,
        agente_usuario: infoSolicitud.userAgent,
        descripcion: `Configuración ${clave} creada con valor ${valor}`
      })

      return configuracion
    })
  },

  /**
   * Actualizar configuración por clave
   */
  actualizar: async (clave, valor, usuarioId = null, infoSolicitud = {}) => {
    return await conTransaccion(async (cliente) => {
      // Obtener valor anterior
      const anteriorResult = await cliente.query(
        `SELECT id, valor FROM configuracion_negocio WHERE clave = $1`,
        [clave]
      )
      
      if (anteriorResult.rows.length === 0) {
        return null
      }

      const anterior = anteriorResult.rows[0]

      // Actualizar
      const result = await cliente.query(
        `UPDATE configuracion_negocio 
         SET valor = $2
         WHERE clave = $1
         RETURNING *`,
        [clave, valor]
      )

      const configuracion = result.rows[0]

      // Registrar en historial si cambió el valor
      if (anterior.valor !== valor) {
        await registrarHistorial(cliente, {
          tabla_afectada: 'configuracion_negocio',
          registro_id: configuracion.id,
          accion: 'ACTUALIZAR',
          valores_anteriores: { [clave]: anterior.valor },
          valores_nuevos: { [clave]: valor },
          campos_modificados: ['valor'],
          usuario_id: usuarioId,
          direccion_ip: infoSolicitud.ip,
          agente_usuario: infoSolicitud.userAgent,
          descripcion: `Configuración ${clave} actualizada de ${anterior.valor} a ${valor}`
        })
      }

      return configuracion
    })
  },

  /**
   * Actualizar múltiples configuraciones
   */
  actualizarVarias: async (configs, usuarioId = null, infoSolicitud = {}) => {
    const actualizadas = []

    for (const config of configs) {
      const actualizada = await ConfiguracionModel.actualizar(
        config.key || config.clave,
        config.value || config.valor,
        usuarioId,
        infoSolicitud
      )
      if (actualizada) {
        actualizadas.push(actualizada)
      }
    }

    return actualizadas
  },

  /**
   * Establecer valor de configuracion (upsert)
   */
  establecer: async (clave, valor, usuarioId = null, infoSolicitud = {}) => {
    return await conTransaccion(async (cliente) => {
      // Obtener valor anterior
      const anteriorResult = await cliente.query(
        `SELECT id, valor FROM configuracion_negocio WHERE clave = $1`,
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