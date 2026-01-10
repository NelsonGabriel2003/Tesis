/**
 * Business Config Model
 * Consultas a la base de datos para configuración del negocio
 */

import { query } from '../config/database.js'

const ConfigModel = {
  /**
   * Obtener todas las configuraciones
   */
  findAll: async () => {
    const result = await query(
      `SELECT id, key, value, description, category, updated_at
       FROM business_config
       ORDER BY category, key`
    )
    return result.rows
  },

  /**
   * Obtener configuraciones por categoría
   */
  findByCategory: async (category) => {
    const result = await query(
      `SELECT id, key, value, description, category, updated_at
       FROM business_config
       WHERE category = $1
       ORDER BY key`,
      [category]
    )
    return result.rows
  },

  /**
   * Obtener una configuración por key
   */
  findByKey: async (key) => {
    const result = await query(
      `SELECT * FROM business_config WHERE key = $1`,
      [key]
    )
    return result.rows[0]
  },

  /**
   * Obtener valor de una configuración (devuelve solo el valor)
   */
  getValue: async (key, defaultValue = null) => {
    const result = await query(
      `SELECT value FROM business_config WHERE key = $1`,
      [key]
    )
    return result.rows[0]?.value ?? defaultValue
  },

  /**
   * Obtener múltiples valores como objeto
   */
  getValues: async (keys) => {
    const result = await query(
      `SELECT key, value FROM business_config WHERE key = ANY($1)`,
      [keys]
    )
    const config = {}
    result.rows.forEach(row => {
      config[row.key] = row.value
    })
    return config
  },

  /**
   * Actualizar una configuración
   */
  update: async (key, value) => {
    const result = await query(
      `UPDATE business_config
       SET value = $2, updated_at = CURRENT_TIMESTAMP
       WHERE key = $1
       RETURNING *`,
      [key, value]
    )
    return result.rows[0]
  },

  /**
   * Actualizar múltiples configuraciones
   */
  updateMany: async (configs) => {
    const results = []
    for (const { key, value } of configs) {
      const result = await ConfigModel.update(key, value)
      if (result) results.push(result)
    }
    return results
  },

  /**
   * Crear una configuración (si no existe)
   */
  create: async (configData) => {
    const { key, value, description, category } = configData
    const result = await query(
      `INSERT INTO business_config (key, value, description, category)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         description = COALESCE(EXCLUDED.description, business_config.description),
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, value, description, category || 'general']
    )
    return result.rows[0]
  },

  /**
   * Obtener configuración de puntos formateada
   */
  getPointsConfig: async () => {
    const config = await ConfigModel.getValues([
      'points_per_dollar',
      'points_expiration_days'
    ])
    return {
      pointsPerDollar: parseFloat(config.points_per_dollar) || 1,
      expirationDays: parseInt(config.points_expiration_days) || 365
    }
  },

  /**
   * Obtener configuración de membresías formateada
   */
  getMembershipConfig: async () => {
  const rows = await query(
    `SELECT key, value FROM business_config 
     WHERE category = 'membership'
     ORDER BY key`
  )
  
  const config = {}
  rows.rows.forEach(row => {
    config[row.key] = row.value
  })

  return {
    levels: {
      bronce: {
        name: 'Bronce',
        icon: config.icon_bronce,
        color: config.color_bronce,
        minPoints: parseInt(config.threshold_bronce),
        multiplier: parseFloat(config.multiplier_bronce)
      },
      plata: {
        name: 'Plata',
        icon: config.icon_plata,
        color: config.color_plata,
        minPoints: parseInt(config.threshold_plata),
        multiplier: parseFloat(config.multiplier_plata)
      },
      oro: {
        name: 'Oro',
        icon: config.icon_oro,
        color: config.color_oro,
        minPoints: parseInt(config.threshold_oro),
        multiplier: parseFloat(config.multiplier_oro)
      },
      platino: {
        name: 'Platino',
        icon: config.icon_platino,
        color: config.color_platino,
        minPoints: parseInt(config.threshold_platino),
        multiplier: parseFloat(config.multiplier_platino)
      }
    }
  }
},

  /**
   * Calcular nivel de membresía según puntos
   */
  calculateMembershipLevel: async (totalPoints) => {
    const { levels } = await ConfigModel.getMembershipConfig()
    
    if (totalPoints >= levels.platino.minPoints) return 'platino'
    if (totalPoints >= levels.oro.minPoints) return 'oro'
    if (totalPoints >= levels.plata.minPoints) return 'plata'
    return 'bronce'
  }
}

export default ConfigModel
