/**
 * Reward Controller
 * Maneja operaciones de recompensas y canjes
 */

const RewardModel = require('../models/reward.model')
const RedemptionModel = require('../models/redemption.model')
const UserModel = require('../models/user.model')
const TransactionModel = require('../models/transaction.model')
const { asyncHandler } = require('../middlewares')

/**
 * Genera un código único de canje
 */
const generateRedemptionCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Obtener todas las recompensas
 * GET /api/rewards
 */
const getRewards = asyncHandler(async (req, res) => {
  const { category } = req.query
  
  const rewards = await RewardModel.findAll(category)

  res.json({
    success: true,
    count: rewards.length,
    data: rewards.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      pointsCost: reward.points_cost,
      category: reward.category,
      imageUrl: reward.image_url,
      stock: reward.stock,
      isPopular: reward.is_popular
    }))
  })
})

/**
 * Obtener recompensa por ID
 * GET /api/rewards/:id
 */
const getRewardById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const reward = await RewardModel.findById(id)

  if (!reward) {
    return res.status(404).json({
      success: false,
      message: 'Recompensa no encontrada'
    })
  }

  res.json({
    success: true,
    data: {
      id: reward.id,
      name: reward.name,
      description: reward.description,
      pointsCost: reward.points_cost,
      category: reward.category,
      imageUrl: reward.image_url,
      stock: reward.stock,
      isPopular: reward.is_popular
    }
  })
})

/**
 * Canjear una recompensa
 * POST /api/rewards/:id/redeem
 */
const redeemReward = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  // Obtener recompensa
  const reward = await RewardModel.findById(id)

  if (!reward) {
    return res.status(404).json({
      success: false,
      message: 'Recompensa no encontrada'
    })
  }

  if (!reward.is_available || reward.stock <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Recompensa no disponible'
    })
  }

  // Obtener usuario
  const user = await UserModel.findById(userId)

  if (user.current_points < reward.points_cost) {
    return res.status(400).json({
      success: false,
      message: 'No tienes suficientes puntos',
      required: reward.points_cost,
      available: user.current_points
    })
  }

  // Generar código de canje
  const redemptionCode = generateRedemptionCode()

  // Restar puntos al usuario
  const updatedUser = await UserModel.subtractPoints(userId, reward.points_cost)

  // Reducir stock de la recompensa
  await RewardModel.decreaseStock(id)

  // Crear registro de canje
  const redemption = await RedemptionModel.create({
    user_id: userId,
    reward_id: id,
    points_spent: reward.points_cost,
    redemption_code: redemptionCode
  })

  // Registrar transacción
  await TransactionModel.create({
    user_id: userId,
    type: 'redeemed',
    points: reward.points_cost,
    description: `Canje: ${reward.name}`,
    reference_type: 'redemption',
    reference_id: redemption.id
  })

  res.status(201).json({
    success: true,
    message: 'Canje realizado exitosamente',
    data: {
      redemptionCode,
      reward: {
        name: reward.name,
        pointsSpent: reward.points_cost
      },
      newBalance: updatedUser.current_points
    }
  })
})

/**
 * Obtener mis canjes
 * GET /api/rewards/my-redemptions
 */
const getMyRedemptions = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { limit = 20, offset = 0 } = req.query

  const redemptions = await RedemptionModel.findByUserId(userId, parseInt(limit), parseInt(offset))

  res.json({
    success: true,
    count: redemptions.length,
    data: redemptions.map(r => ({
      id: r.id,
      rewardName: r.reward_name,
      rewardCategory: r.reward_category,
      pointsSpent: r.points_spent,
      redemptionCode: r.redemption_code,
      status: r.status,
      createdAt: r.created_at,
      usedAt: r.used_at
    }))
  })
})

/**
 * Validar código de canje (para empleados)
 * GET /api/rewards/validate/:code
 */
const validateRedemptionCode = asyncHandler(async (req, res) => {
  const { code } = req.params

  const redemption = await RedemptionModel.findByCode(code.toUpperCase())

  if (!redemption) {
    return res.status(404).json({
      success: false,
      message: 'Código de canje no encontrado'
    })
  }

  res.json({
    success: true,
    data: {
      id: redemption.id,
      rewardName: redemption.reward_name,
      userName: redemption.user_name,
      status: redemption.status,
      createdAt: redemption.created_at,
      usedAt: redemption.used_at
    }
  })
})

/**
 * Marcar canje como usado (para empleados)
 * POST /api/rewards/use/:code
 */
const useRedemptionCode = asyncHandler(async (req, res) => {
  const { code } = req.params

  const redemption = await RedemptionModel.markAsUsedByCode(code.toUpperCase())

  if (!redemption) {
    return res.status(400).json({
      success: false,
      message: 'Código inválido o ya fue utilizado'
    })
  }

  res.json({
    success: true,
    message: 'Canje procesado exitosamente',
    data: {
      id: redemption.id,
      status: redemption.status,
      usedAt: redemption.used_at
    }
  })
})

/**
 * Obtener categorías de recompensas
 * GET /api/rewards/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await RewardModel.getCategories()

  res.json({
    success: true,
    data: categories
  })
})

/**
 * Crear recompensa (Admin)
 * POST /api/rewards
 */
const createReward = asyncHandler(async (req, res) => {
  const rewardData = req.body

  if (!rewardData.name || !rewardData.points_cost || !rewardData.category) {
    return res.status(400).json({
      success: false,
      message: 'Nombre, costo en puntos y categoría son requeridos'
    })
  }

  const reward = await RewardModel.create(rewardData)

  res.status(201).json({
    success: true,
    message: 'Recompensa creada exitosamente',
    data: reward
  })
})

/**
 * Actualizar recompensa (Admin)
 * PUT /api/rewards/:id
 */
const updateReward = asyncHandler(async (req, res) => {
  const { id } = req.params
  const rewardData = req.body

  const reward = await RewardModel.update(id, rewardData)

  if (!reward) {
    return res.status(404).json({
      success: false,
      message: 'Recompensa no encontrada'
    })
  }

  res.json({
    success: true,
    message: 'Recompensa actualizada',
    data: reward
  })
})

module.exports = {
  getRewards,
  getRewardById,
  redeemReward,
  getMyRedemptions,
  validateRedemptionCode,
  useRedemptionCode,
  getCategories,
  createReward,
  updateReward
}
