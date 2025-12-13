/**
 * Canje Services
 * Servicios para el módulo de canje - Conectado al Backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Helper para obtener headers con token
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

export const canjeService = {
  /**
   * Obtener puntos actuales del usuario
   */
  getUserPoints: async () => {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al obtener puntos')
    }

    const result = await response.json()
    return result.data.points?.current || 0
  },

  /**
   * Obtener todas las recompensas
   */
  getRewards: async () => {
    const response = await fetch(`${API_URL}/rewards`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al obtener recompensas')
    }

    const result = await response.json()
    return result.data.map(reward => ({
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
    let url = `${API_URL}/rewards`
    if (categoryId && categoryId !== 'todos') {
      url += `?category=${categoryId}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al obtener recompensas')
    }

    const result = await response.json()
    return result.data.map(reward => ({
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
    const response = await fetch(`${API_URL}/rewards/${id}`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    const reward = result.data
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
  },

  /**
   * Obtener categorías
   */
  getCategories: async () => {
    const response = await fetch(`${API_URL}/rewards/categories`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      // Devolver categorías por defecto si falla
      return [
        { id: 'todos', name: 'Todos', icon: '🎁' },
        { id: 'bebidas', name: 'Bebidas', icon: '🍺' },
        { id: 'comidas', name: 'Comidas', icon: '🍔' },
        { id: 'experiencias', name: 'Experiencias', icon: '✨' },
        { id: 'descuentos', name: 'Descuentos', icon: '💰' }
      ]
    }

    const result = await response.json()
    return [
      { id: 'todos', name: 'Todos', icon: '🎁' },
      ...result.data.map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        icon: getIconForCategory(cat)
      }))
    ]
  },

  /**
   * Canjear una recompensa
   */
  redeemReward: async (rewardId) => {
    const response = await fetch(`${API_URL}/rewards/${rewardId}/redeem`, {
      method: 'POST',
      headers: getHeaders()
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Error al canjear recompensa')
    }

    return {
      success: true,
      redeemCode: result.data.redemptionCode,
      reward: result.data.reward,
      pointsSpent: result.data.reward.pointsSpent,
      newBalance: result.data.newBalance,
      message: result.message
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
    const response = await fetch(`${API_URL}/rewards/user/my-redemptions`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al obtener canjes')
    }

    const result = await response.json()
    return result.data
  }
}

// Helper para obtener icono de categoría
const getIconForCategory = (category) => {
  const icons = {
    'bebidas': '🍺',
    'comidas': '🍔',
    'experiencias': '✨',
    'descuentos': '💰',
    'merchandise': '👕'
  }
  return icons[category.toLowerCase()] || '🎁'
}
