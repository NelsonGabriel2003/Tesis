/**
 * Service Controller
 * Maneja operaciones de servicios del bar
 */

const ServiceModel = require('../models/service.model')
const UserModel = require('../models/user.model')
const TransactionModel = require('../models/transaction.model')
const { asyncHandler } = require('../middlewares')

/**
 * Obtener todos los servicios
 * GET /api/services
 */
const getServices = asyncHandler(async (req, res) => {
  const { category } = req.query
  
  const services = await ServiceModel.findAll(category)

  res.json({
    success: true,
    count: services.length,
    data: services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      pointsRequired: service.points_required,
      pointsEarned: service.points_earned,
      category: service.category,
      imageUrl: service.image_url
    }))
  })
})

/**
 * Obtener servicio por ID
 * GET /api/services/:id
 */
const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const service = await ServiceModel.findById(id)

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Servicio no encontrado'
    })
  }

  res.json({
    success: true,
    data: {
      id: service.id,
      name: service.name,
      description: service.description,
      pointsRequired: service.points_required,
      pointsEarned: service.points_earned,
      category: service.category,
      imageUrl: service.image_url
    }
  })
})

/**
 * Reservar un servicio
 * POST /api/services/:id/book
 */
const bookService = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.id
  const { date, time, notes } = req.body

  // Obtener servicio
  const service = await ServiceModel.findById(id)

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Servicio no encontrado'
    })
  }

  // Obtener usuario
  const user = await UserModel.findById(userId)

  // Verificar si tiene suficientes puntos (si el servicio los requiere)
  if (service.points_required > 0 && user.current_points < service.points_required) {
    return res.status(400).json({
      success: false,
      message: 'No tienes suficientes puntos para este servicio',
      required: service.points_required,
      available: user.current_points
    })
  }

  let updatedUser = user

  // Descontar puntos si el servicio los requiere
  if (service.points_required > 0) {
    updatedUser = await UserModel.subtractPoints(userId, service.points_required)

    // Registrar transacción de puntos usados
    await TransactionModel.create({
      user_id: userId,
      type: 'redeemed',
      points: service.points_required,
      description: `Servicio: ${service.name}`,
      reference_type: 'service',
      reference_id: service.id
    })
  }

  // Agregar puntos ganados por usar el servicio
  if (service.points_earned > 0) {
    updatedUser = await UserModel.addPoints(userId, service.points_earned)

    // Registrar transacción de puntos ganados
    await TransactionModel.create({
      user_id: userId,
      type: 'earned',
      points: service.points_earned,
      description: `Bonus por servicio: ${service.name}`,
      reference_type: 'service',
      reference_id: service.id
    })
  }

  // TODO: Crear registro de reserva en tabla bookings

  res.status(201).json({
    success: true,
    message: 'Servicio reservado exitosamente',
    data: {
      service: {
        name: service.name,
        pointsUsed: service.points_required,
        pointsEarned: service.points_earned
      },
      booking: {
        date,
        time,
        notes
      },
      newBalance: updatedUser.current_points
    }
  })
})

/**
 * Obtener categorías de servicios
 * GET /api/services/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await ServiceModel.getCategories()

  res.json({
    success: true,
    data: categories
  })
})

/**
 * Crear servicio (Admin)
 * POST /api/services
 */
const createService = asyncHandler(async (req, res) => {
  const serviceData = req.body

  if (!serviceData.name || !serviceData.category) {
    return res.status(400).json({
      success: false,
      message: 'Nombre y categoría son requeridos'
    })
  }

  const service = await ServiceModel.create(serviceData)

  res.status(201).json({
    success: true,
    message: 'Servicio creado exitosamente',
    data: service
  })
})

/**
 * Actualizar servicio (Admin)
 * PUT /api/services/:id
 */
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params
  const serviceData = req.body

  const service = await ServiceModel.update(id, serviceData)

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Servicio no encontrado'
    })
  }

  res.json({
    success: true,
    message: 'Servicio actualizado',
    data: service
  })
})

module.exports = {
  getServices,
  getServiceById,
  bookService,
  getCategories,
  createService,
  updateService
}
