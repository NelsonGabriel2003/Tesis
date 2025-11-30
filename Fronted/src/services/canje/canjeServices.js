/**
 * Canje Services
 * Servicios para el módulo de canje (mock sin base de datos)
 */

import { mockRewards, canjeCategories } from '../../models/canje/canjeModel'

// Simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const canjeService = {
  /**
   * Obtener todas las recompensas
   */
  getRewards: async () => {
    await delay(500)
    return mockRewards
  },

  /**
   * Obtener recompensas por categoría
   */
  getRewardsByCategory: async (categoryId) => {
    await delay(300)
    if (categoryId === 'todos') {
      return mockRewards
    }
    return mockRewards.filter(reward => reward.category === categoryId)
  },

  /**
   * Obtener recompensas populares
   */
  getPopularRewards: async () => {
    await delay(300)
    return mockRewards.filter(reward => reward.popular)
  },

  /**
   * Obtener una recompensa por ID
   */
  getRewardById: async (id) => {
    await delay(200)
    return mockRewards.find(reward => reward.id === id) || null
  },

  /**
   * Obtener categorías
   */
  getCategories: async () => {
    await delay(100)
    return canjeCategories
  },

  /**
   * Canjear una recompensa
   */
  redeemReward: async (rewardId, userPoints) => {
    await delay(1000)
    const reward = mockRewards.find(r => r.id === rewardId)

    if (!reward) {
      throw new Error('Recompensa no encontrada')
    }

    if (reward.stock <= 0) {
      throw new Error('Recompensa agotada')
    }

    if (userPoints < reward.pointsCost) {
      throw new Error('Puntos insuficientes')
    }

    // Simular canje exitoso
    return {
      success: true,
      redeemCode: `CANJE-${Date.now().toString(36).toUpperCase()}`,
      reward: reward,
      pointsSpent: reward.pointsCost,
      newBalance: userPoints - reward.pointsCost,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      message: '¡Canje realizado exitosamente!'
    }
  },

  /**
   * Verificar si puede canjear
   */
  canRedeem: (reward, userPoints) => {
    return userPoints >= reward.pointsCost && reward.stock > 0
  },

  /**
   * Buscar recompensas
   */
  searchRewards: async (query) => {
    await delay(300)
    const lowerQuery = query.toLowerCase()
    return mockRewards.filter(reward =>
      reward.name.toLowerCase().includes(lowerQuery) ||
      reward.description.toLowerCase().includes(lowerQuery)
    )
  }
}
