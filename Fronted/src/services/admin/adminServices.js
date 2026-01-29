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
 * Servicio para gestión del Personal (Staff)
 */
export const staffService = {
  // Obtener todo el personal
  getAll: async () => {
    const response = await api.get('/staff')
    return response.data
  },

  // Obtener personal por ID
  getById: async (id) => {
    const response = await api.get(`/staff/${id}`)
    return response.data
  },

  // Crear nuevo personal
  create: async (staffData) => {
    const response = await api.post('/staff', staffData)
    return response.data
  },

  // Actualizar personal
  update: async (id, staffData) => {
    const response = await api.put(`/staff/${id}`, staffData)
    return response.data
  },

  // Eliminar personal
  delete: async (id) => {
    const response = await api.delete(`/staff/${id}`)
    return response
  },

  // Generar código de vinculación Telegram
  generateLinkCode: async (id) => {
    const response = await api.post(`/staff/${id}/generate-code`)
    return response.data
  },

  // Desvincular Telegram
  unlinkTelegram: async (id) => {
    const response = await api.delete(`/staff/${id}/telegram`)
    return response
  },

  // Obtener personal en turno
  getOnShift: async () => {
    const response = await api.get('/staff/on-shift')
    return response.data
  },

  // Cambiar estado de turno
  toggleShift: async (id, isOnShift) => {
    const response = await api.put(`/staff/${id}/shift`, { isOnShift })
    return response.data
  }
}

/**
 * Servicio para gestión de Configuración del Negocio
 */
export const configService = {
  // Obtener todas las configuraciones
  getAll: async () => {
    const response = await api.get('/config')
    return response.data
  },

  // Obtener configuraciones por categoría
  getByCategory: async (category) => {
    const response = await api.get(`/config?category=${category}`)
    return response.data
  },

  // Obtener configuración de puntos (pública)
  getPointsConfig: async () => {
    const response = await api.get('/config/points')
    return response.data
  },

  // Obtener configuración de membresías (pública)
  getMembershipConfig: async () => {
    const response = await api.get('/config/membership')
    return response.data
  },

  // Actualizar una configuración
  update: async (key, value) => {
    const response = await api.put(`/config/${key}`, { value })
    return response.data
  },

  // Actualizar múltiples configuraciones
  updateMany: async (configs) => {
    const response = await api.put('/config', { configs })
    return response.data
  }
}

/**
 * Servicio para subida de imágenes
 */
export const uploadService = {
  // Subir imagen
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    const token = localStorage.getItem('token')
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error al subir imagen')
    }

    return data
  },

  // Eliminar imagen
  deleteImage: async (publicId) => {
    const response = await api.delete(`/upload/image/${encodeURIComponent(publicId)}`)
    return response
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
  },

  
  // Obtener canjes de un usuario específico
  obtenerCanjesUsuario: async (usuarioId) => {
    const response = await api.get(`/stats/users/${usuarioId}/canjes`)
    return response
  },

  // Marcar canje como entregado
  entregarCanje: async (canjeId) => {
    const response = await api.post(`/stats/canjes/${canjeId}/entregar`)
    return response
  },

  // Obtener todos los canjes (para polling)
  obtenerTodosCanjes: async (status = null, limit = 50) => {
    let url = `/stats/canjes?limit=${limit}`
    if (status) url += `&status=${status}`
    const response = await api.get(url)
    return response
  },

  // Obtener solo canjes pendientes
  obtenerCanjesPendientes: async () => {
    const response = await api.get('/stats/canjes/pendientes')
    return response
  }
}

/**
 * Servicio para gestión de Fotos/Eventos
 */
export const photoService = {
  // Obtener todas las fotos (publico)
  getAll: async () => {
    const response = await api.get('/photos')
    return response.data
  },

  // Obtener todas las fotos (admin - incluye inactivas)
  getAllAdmin: async () => {
    const response = await api.get('/photos/admin/all')
    return response.data
  },

  // Obtener foto por ID
  getById: async (id) => {
    const response = await api.get(`/photos/${id}`)
    return response.data
  },

  // Crear foto
  create: async (photoData) => {
    const response = await api.post('/photos', photoData)
    return response.data
  },

  // Actualizar foto
  update: async (id, photoData) => {
    const response = await api.put(`/photos/${id}`, photoData)
    return response.data
  },

  // Eliminar foto
  delete: async (id) => {
    const response = await api.delete(`/photos/${id}`)
    return response
  }
}



export default {
  productService,
  rewardService,
  serviceService,
  userService,
  staffService,
  statsService,
  photoService
}
