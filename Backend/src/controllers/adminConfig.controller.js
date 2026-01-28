import AdminConfigModel from '../models/adminConfig.model.js'

const adminConfigController = {
  // GET /api/admin/config
  getAll: async (req, res) => {
    try {
      const configs = await AdminConfigModel.getAll()
      res.json({
        success: true,
        data: configs
      })
    } catch (error) {
      console.error('Error obteniendo configuración:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener configuración'
      })
    }
  },

  // GET /api/admin/config/category/:category
  getByCategory: async (req, res) => {
    try {
      const { category } = req.params
      const configs = await AdminConfigModel.getByCategory(category)
      res.json({
        success: true,
        data: configs
      })
    } catch (error) {
      console.error('Error obteniendo configuración:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener configuración'
      })
    }
  },

  // GET /api/admin/config/membership
  getMembership: async (req, res) => {
    try {
      const config = await AdminConfigModel.getMembershipConfig()
      res.json({
        success: true,
        data: config
      })
    } catch (error) {
      console.error('Error obteniendo membresía:', error)
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // GET /api/admin/config/points
  getPoints: async (req, res) => {
    try {
      const config = await AdminConfigModel.getPointsConfig()
      res.json({
        success: true,
        data: config
      })
    } catch (error) {
      console.error('Error obteniendo puntos:', error)
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // PUT /api/admin/config/:key
  update: async (req, res) => {
    try {
      const { key } = req.params
      const { value } = req.body

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'El valor es requerido'
        })
      }

      const updated = await AdminConfigModel.update(key, value)

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
    } catch (error) {
      console.error('Error actualizando configuración:', error)
      res.status(500).json({
        success: false,
        message: 'Error al actualizar configuración'
      })
    }
  },

  // PUT /api/admin/config/batch
  updateMany: async (req, res) => {
    try {
      const { configs } = req.body

      if (!Array.isArray(configs)) {
        return res.status(400).json({
          success: false,
          message: 'Se espera un array de configuraciones'
        })
      }

      const updated = await AdminConfigModel.updateMany(configs)

      res.json({
        success: true,
        message: `${updated.length} configuraciones actualizadas`,
        data: updated
      })
    } catch (error) {
      console.error('Error actualizando configuraciones:', error)
      res.status(500).json({
        success: false,
        message: 'Error al actualizar configuraciones'
      })
    }
  }
}

export default adminConfigController