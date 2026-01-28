/**
 * Canje Services
 * Servicios para el módulo de canje - Conectado al Backend
 */
import api from '../api.js'

export const canjeService = {
  /**
   * Obtener puntos actuales del usuario
   */
  getUserPoints: async () => {
    const res = await api.get('/profile')
    return res.data.points?.current || 0
  },

  /**
   * Obtener todas las recompensas
   */
  getRewards: async () => {
    const res = await api.get('/rewards')
    return res.data.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category,
      imageUrl: reward.imageUrl,
      stock: reward.stock,
      popular: reward.isPopular
    }))
  },

  /**
   * Obtener recompensas por categoría
   */
  getRewardsByCategory: async (categoryId) => {
    let endpoint = '/rewards'
    if (categoryId && categoryId !== 'todos') {
      endpoint += `?category=${categoryId}`
    }
    const res = await api.get(endpoint)
    return res.data.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category,
      imageUrl: reward.imageUrl,
      stock: reward.stock,
      popular: reward.isPopular
    }))
  },

  /**
   * Obtener recompensas populares
   */
  getPopularRewards: async () => {
    const rewards = await canjeService.getRewards()
    return rewards.filter(reward => reward.popular)
  },

  /**
   * Obtener una recompensa por ID
   */
  getRewardById: async (id) => {
    try {
      const res = await api.get(`/rewards/${id}`)
      const reward = res.data
      return {
        id: reward.id,
        name: reward.name,
        description: reward.description,
        pointsCost: reward.pointsCost,
        category: reward.category,
        imageUrl: reward.imageUrl,
        stock: reward.stock,
        popular: reward.isPopular
      }
    } catch {
      return null
    }
  },

  /**
   * Obtener categorías
   */
  getCategories: async () => {
    try {
      const res = await api.get('/rewards/categories')
      return [
        { id: 'todos', name: 'Todos', icon: '🎁' },
        ...res.data.map(cat => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: getIconForCategory(cat)
        }))
      ]
    } catch {
      // Devolver categorías por defecto si falla
      return [
        { id: 'todos', name: 'Todos', icon: '🎁' },
        { id: 'bebidas', name: 'Bebidas', icon: '🍺' },
        { id: 'comidas', name: 'Comidas', icon: '🍔' },
        { id: 'experiencias', name: 'Experiencias', icon: '✨' },
        { id: 'descuentos', name: 'Descuentos', icon: '💰' }
      ]
    }
  },

  /**
   * Canjear una recompensa
   */
  redeemReward: async (rewardId) => {
    const res = await api.post(`/rewards/${rewardId}/redeem`)
    return {
      success: true,
      redeemCode: res.data.redemptionCode,
      reward: res.data.reward,
      pointsSpent: res.data.reward.pointsSpent,
      newBalance: res.data.newBalance,
      message: res.message
    }
  },

  /**
   * Verificar si puede canjear (solo lógica local)
   */
  canRedeem: (reward, userPoints) => {
    return userPoints >= reward.pointsCost && reward.stock > 0
  },

  /**
   * Buscar recompensas (filtra localmente)
   */
  searchRewards: async (query) => {
    const rewards = await canjeService.getRewards()
    const lowerQuery = query.toLowerCase()
    return rewards.filter(reward =>
      reward.name.toLowerCase().includes(lowerQuery) ||
      reward.description.toLowerCase().includes(lowerQuery)
    )
  },

  /**
   * Obtener mis canjes
   */
  getMyRedemptions: async () => {
    const res = await api.get('/rewards/user/my-redemptions')
    return res.data
  }
}

// Helper para obtener icono de categoría
const getIconForCategory = (category) => {
  const icons = {
    'bebidas': '🍺',
    'comida': '🍔',
    'experiencias': '✨',
    'descuentos': '💰',
    'merchandise': '👕'
  }
  return icons[category.toLowerCase()] || '🎁'
}