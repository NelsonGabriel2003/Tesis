/**
 * Admin Services
 * Servicios para el módulo administrativo - Conexión con Backend
 */

import api from '../api'

/**
 * Servicio para gestión de Productos
 */
export const productService = {
  // Obtener todos los productos
  getAll: async () => {
    const response = await api.get('/products')
    return response.data
  },

  // Obtener producto por ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  // Obtener categorías
  getCategories: async () => {
    const response = await api.get('/products/categories')
    return response.data
  },

  // Buscar productos
  search: async (query) => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Crear producto
  create: async (productData) => {
    const response = await api.post('/products', productData)
    return response.data
  },

  // Actualizar producto
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  // Eliminar producto
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response
  }
}

/**
 * Servicio para gestión de Recompensas
 */
export const rewardService = {
  // Obtener todas las recompensas
  getAll: async () => {
    const response = await api.get('/rewards')
    return response.data
  },

  // Obtener recompensa por ID
  getById: async (id) => {
    const response = await api.get(`/rewards/${id}`)
    return response.data
  },

  // Obtener categorías
  getCategories: async () => {
    const response = await api.get('/rewards/categories')
    return response.data
  },

  // Crear recompensa
  create: async (rewardData) => {
    const response = await api.post('/rewards', rewardData)
    return response.data
  },

  // Actualizar recompensa
  update: async (id, rewardData) => {
    const response = await api.put(`/rewards/${id}`, rewardData)
    return response.data
  },

  // Canjear recompensa
  redeem: async (id) => {
    const response = await api.post(`/rewards/${id}/redeem`)
    return response.data
  },

  // Obtener mis canjes
  getMyRedemptions: async () => {
    const response = await api.get('/rewards/user/my-redemptions')
    return response.data
  }
}

/**
 * Servicio para gestión de Servicios
 */
export const serviceService = {
  // Obtener todos los servicios
  getAll: async () => {
    const response = await api.get('/services')
    return response.data
  },

  // Obtener servicio por ID
  getById: async (id) => {
    const response = await api.get(`/services/${id}`)
    return response.data
  },

  // Obtener categorías
  getCategories: async () => {
    const response = await api.get('/services/categories')
    return response.data
  },

  // Crear servicio
  create: async (serviceData) => {
    const response = await api.post('/services', serviceData)
    return response.data
  },

  // Actualizar servicio
  update: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData)
    return response.data
  },

  // Reservar servicio
  book: async (id, bookingData) => {
    const response = await api.post(`/services/${id}/book`, bookingData)
    return response.data
  }
}

/**
 * Servicio para gestión de Usuarios (Admin)
 */
export const userService = {
  // Obtener perfil del usuario actual
  getProfile: async () => {
    const response = await api.get('/profile')
    return response.data
  },

  // Obtener historial de transacciones
  getTransactions: async () => {
    const response = await api.get('/profile/transactions')
    return response.data
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await api.get('/profile/stats')
    return response.data
  },

  // Obtener niveles de membresía
  getLevels: async () => {
    const response = await api.get('/profile/levels')
    return response.data
  }
}

/**
 * Servicio para estadísticas del Dashboard (Admin)
 */
export const statsService = {
  // Obtener resumen completo del dashboard
  getDashboard: async () => {
    const response = await api.get('/stats/dashboard')
    return response.data
  },

  // Obtener solo contadores principales
  getSummary: async () => {
    const response = await api.get('/stats/summary')
    return response.data
  },

  // Obtener estadísticas de usuarios
  getUserStats: async () => {
    const response = await api.get('/stats/users')
    return response.data
  },

  // Obtener estadísticas de puntos
  getPointsStats: async () => {
    const response = await api.get('/stats/points')
    return response.data
  },

  // Obtener estadísticas de canjes
  getRedemptionStats: async () => {
    const response = await api.get('/stats/redemptions')
    return response.data
  },

  // Obtener transacciones recientes
  getRecentTransactions: async (limit = 10) => {
    const response = await api.get(`/stats/transactions?limit=${limit}`)
    return response.data
  }
}

export default {
  productService,
  rewardService,
  serviceService,
  userService,
  statsService
}
