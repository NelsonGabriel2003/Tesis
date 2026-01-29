/**
 * Admin Config Controller
 * Maneja operaciones de configuración administrativa
 */

import ConfiguracionModel from '../models/configuracion.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener todas las configuraciones
 * GET /api/admin/config
 */
const getAll = asyncHandler(async (req, res) => {
  const configs = await ConfiguracionModel.obtenerTodas()
  res.json({
    success: true,
    data: configs
  })
})

/**
 * Obtener configuraciones por categoría
 * GET /api/admin/config/category/:category
 */
const getByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params
  const configs = await ConfiguracionModel.obtenerPorCategoria(category)
  res.json({
    success: true,
    data: configs
  })
})

/**
 * Obtener configuración de membresía
 * GET /api/admin/config/membership
 */
const getMembership = asyncHandler(async (req, res) => {
  const config = await ConfiguracionModel.obtenerConfigMembresia()
  res.json({
    success: true,
    data: config
  })
})

/**
 * Obtener configuración de puntos
 * GET /api/admin/config/points
 */
const getPoints = asyncHandler(async (req, res) => {
  const config = await ConfiguracionModel.obtenerConfigPuntos()
  res.json({
    success: true,
    data: config
  })
})

/**
 * Actualizar una configuración
 * PUT /api/admin/config/:key
 */
const update = asyncHandler(async (req, res) => {
  const { key } = req.params
  const { value } = req.body

  if (value === undefined) {
    return res.status(400).json({
      success: false,
      message: 'El valor es requerido'
    })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const updated = await ConfiguracionModel.actualizar(key, value, req.user?.id, infoSolicitud)

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Configuración no encontrada'
    })
  }

  res.json({
    success: true,
    message: 'Configuración actualizada',
    data: updated
  })
})

/**
 * Actualizar múltiples configuraciones
 * PUT /api/admin/config/batch
 */
const updateMany = asyncHandler(async (req, res) => {
  const { configs } = req.body

  if (!Array.isArray(configs)) {
    return res.status(400).json({
      success: false,
      message: 'Se espera un array de configuraciones'
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
    data: updated
  })
})

const adminConfigController = {
  getAll,
  getByCategory,
  getMembership,
  getPoints,
  update,
  updateMany
}

export default adminConfigController