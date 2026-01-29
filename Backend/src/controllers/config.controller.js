/**
 * Config Controller
 * Maneja operaciones de configuración del negocio
 */

import ConfiguracionModel from '../models/configuracion.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener todas las configuraciones
 * GET /api/config
 */
const getAllConfig = asyncHandler(async (req, res) => {
  const { category } = req.query

  let configs
  if (category) {
    configs = await ConfiguracionModel.obtenerPorCategoria(category)
  } else {
    configs = await ConfiguracionModel.obtenerTodas()
  }

  res.json({
    success: true,
    count: configs.length,
    data: configs.map(config => ({
      id: config.id,
      key: config.clave,
      value: config.valor,
      description: config.descripcion,
      category: config.categoria
    }))
  })
})

/**
 * Obtener configuración de puntos
 * GET /api/config/points
 */
const getPointsConfig = asyncHandler(async (req, res) => {
  const config = await ConfiguracionModel.obtenerConfigPuntos()

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
  const config = await ConfiguracionModel.obtenerConfigMembresia()

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

  const config = await ConfiguracionModel.buscarPorClave(key)

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
      key: config.clave,
      value: config.valor,
      description: config.descripcion,
      category: config.categoria
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

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const config = await ConfiguracionModel.actualizar(key, String(value), req.user?.id, infoSolicitud)

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
      key: config.clave,
      value: config.valor
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

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const updated = await ConfiguracionModel.actualizarVarias(configs, req.user?.id, infoSolicitud)

  res.json({
    success: true,
    message: `${updated.length} configuraciones actualizadas`,
    data: updated.map(config => ({
      key: config.clave,
      value: config.valor
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

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const config = await ConfiguracionModel.crear({
    clave: key,
    valor: String(value),
    descripcion: description,
    categoria: category
  }, req.user?.id, infoSolicitud)

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
