/**
 * Config Controller
 * Maneja operaciones de configuración del negocio
 */

import ConfigModel from '../models/config.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener todas las configuraciones
 * GET /api/config
 */
const getAllConfig = asyncHandler(async (req, res) => {
  const { category } = req.query

  let configs
  if (category) {
    configs = await ConfigModel.findByCategory(category)
  } else {
    configs = await ConfigModel.findAll()
  }

  res.json({
    success: true,
    count: configs.length,
    data: configs.map(config => ({
      id: config.id,
      key: config.key,
      value: config.value,
      description: config.description,
      category: config.category
    }))
  })
})

/**
 * Obtener configuración de puntos
 * GET /api/config/points
 */
const getPointsConfig = asyncHandler(async (req, res) => {
  const config = await ConfigModel.getPointsConfig()

  res.json({
    success: true,
    data: config
  })
})

/**
 * Obtener configuración de membresías
 * GET /api/config/membership
 */
const getMembershipConfig = asyncHandler(async (req, res) => {
  const config = await ConfigModel.getMembershipConfig()

  res.json({
    success: true,
    data: config
  })
})

/**
 * Obtener una configuración por key
 * GET /api/config/:key
 */
const getConfigByKey = asyncHandler(async (req, res) => {
  const { key } = req.params

  const config = await ConfigModel.findByKey(key)

  if (!config) {
    return res.status(404).json({
      success: false,
      message: 'Configuración no encontrada'
    })
  }

  res.json({
    success: true,
    data: {
      id: config.id,
      key: config.key,
      value: config.value,
      description: config.description,
      category: config.category
    }
  })
})

/**
 * Actualizar una configuración (Admin)
 * PUT /api/config/:key
 */
const updateConfig = asyncHandler(async (req, res) => {
  const { key } = req.params
  const { value } = req.body

  if (value === undefined || value === null) {
    return res.status(400).json({
      success: false,
      message: 'El valor es requerido'
    })
  }

  const config = await ConfigModel.update(key, String(value))

  if (!config) {
    return res.status(404).json({
      success: false,
      message: 'Configuración no encontrada'
    })
  }

  res.json({
    success: true,
    message: 'Configuración actualizada',
    data: {
      key: config.key,
      value: config.value
    }
  })
})

/**
 * Actualizar múltiples configuraciones (Admin)
 * PUT /api/config
 */
const updateManyConfig = asyncHandler(async (req, res) => {
  const { configs } = req.body

  if (!configs || !Array.isArray(configs)) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere un array de configuraciones'
    })
  }

  const updated = await ConfigModel.updateMany(configs)

  res.json({
    success: true,
    message: `${updated.length} configuraciones actualizadas`,
    data: updated.map(config => ({
      key: config.key,
      value: config.value
    }))
  })
})

/**
 * Crear configuración (Admin)
 * POST /api/config
 */
const createConfig = asyncHandler(async (req, res) => {
  const { key, value, description, category } = req.body

  if (!key || value === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Key y value son requeridos'
    })
  }

  const config = await ConfigModel.create({
    key,
    value: String(value),
    description,
    category
  })

  res.status(201).json({
    success: true,
    message: 'Configuración creada',
    data: config
  })
})

export {
  getAllConfig,
  getPointsConfig,
  getMembershipConfig,
  getConfigByKey,
  updateConfig,
  updateManyConfig,
  createConfig
}
