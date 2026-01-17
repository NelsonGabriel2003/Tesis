import { query } from '../config/database.js'

const AdminConfigModel = {
  // Obtener todas las configuraciones
  getAll: async () => {
    const result = await query(
      `SELECT * FROM business_config ORDER BY category, key`
    )
    return result.rows
  },

  // Obtener por categoría
  getByCategory: async (category) => {
    const result = await query(
      `SELECT * FROM business_config WHERE category = $1 ORDER BY key`,
      [category]
    )
    return result.rows
  },

  // Obtener un valor específico
  get: async (key) => {
    const result = await query(
      `SELECT * FROM business_config WHERE key = $1`,
      [key]
    )
    return result.rows[0]
  },

  // Obtener valor como número
  getNumber: async (key) => {
    const config = await AdminConfigModel.get(key)
    if (!config) {
      throw new Error(`Configuración '${key}' no encontrada`)
    }
    return parseFloat(config.value)
  },

  // Actualizar un valor
  update: async (key, value) => {
    const result = await query(
      `UPDATE business_config 
       SET value = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE key = $1 
       RETURNING *`,
      [key, value.toString()]
    )
    return result.rows[0]
  },

  // Actualizar múltiples valores
  updateMany: async (configs) => {
    const results = []
    for (const { key, value } of configs) {
      const updated = await AdminConfigModel.update(key, value)
      if (updated) results.push(updated)
    }
    return results
  },

  // Obtener configuración de membresía formateada
  getMembershipConfig: async () => {
    const configs = await AdminConfigModel.getByCategory('membership')
    
    const config = {}
    configs.forEach(c => {
      config[c.key] = c.value
    })

    // Validar que todas las claves existan
    const requiredKeys = [
      'threshold_plata', 'threshold_oro', 'threshold_platino',
      'multiplier_plata', 'multiplier_oro', 'multiplier_platino'
    ]

    const missingKeys = requiredKeys.filter(key => !config[key])
    
    if (missingKeys.length > 0) {
      throw new Error(`Configuración incompleta. Faltan: ${missingKeys.join(', ')}`)
    }

    return {
      thresholds: {
        bronce: 0,
        plata: parseInt(config.threshold_plata),
        oro: parseInt(config.threshold_oro),
        platino: parseInt(config.threshold_platino)
      },
      multipliers: {
        bronce: 1,
        plata: parseFloat(config.multiplier_plata),
        oro: parseFloat(config.multiplier_oro),
        platino: parseFloat(config.multiplier_platino)
      }
    }
  },

  // Obtener configuración de puntos
  getPointsConfig: async () => {
    const configs = await AdminConfigModel.getByCategory('points')
    
    const config = {}
    configs.forEach(c => {
      config[c.key] = c.value
    })

    if (!config.points_per_dollar) {
      throw new Error('Configuración de puntos no encontrada')
    }

    return {
      pointsPerDollar: parseInt(config.points_per_dollar)
    }
  }
}

export default AdminConfigModel