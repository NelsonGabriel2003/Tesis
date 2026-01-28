/**
 * Servicios Services
 * Servicios para el módulo de servicios - Conectado al Backend
 */

import api from '../api.js'

export const serviciosService = {
  /**
   * Obtener todos los servicios
   */
  getServicios: async () => {
    const response = await api.get('/services')
    return response.data.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      icon: '📋',
      category: service.category,
      available: service.isActive !== false,
      pointsRequired: service.pointsRequired || 0,
      pointsReward: service.pointsEarned || 0,
      imageUrl: service.imageUrl
    }))
  },

  /**
   * Obtener servicios por categoría
   */
  getServiciosByCategory: async (categoryId) => {
    let endpoint = '/services'
    if (categoryId && categoryId !== 'todos') {
      endpoint += `?category=${categoryId}`
    }
    const response = await api.get(endpoint)
    return response.data.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      icon: '📋',
      category: service.category,
      available: service.isActive !== false,
      pointsRequired: service.pointsRequired || 0,
      pointsReward: service.pointsEarned || 0,
      imageUrl: service.imageUrl
    }))
  },

  /**
   * Obtener un servicio por ID
   */
  getServicioById: async (id) => {
    try {
      const response = await api.get(`/services/${id}`)
      const service = response.data
      return {
        id: service.id,
        name: service.name,
        description: service.description,
        icon: '📋',
        category: service.category,
        available: service.isActive !== false,
        pointsRequired: service.pointsRequired || 0,
        pointsReward: service.pointsEarned || 0,
        imageUrl: service.imageUrl
      }
    } catch {
      return null
    }
  },

  /**
   * Obtener categorías
   */
  getCategorias: async () => {
    try {
      const response = await api.get('/services/categories')
      return [
        { id: 'todos', name: 'Todos', icon: '📋' },
        ...response.data.map(cat => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: '📋'
        }))
      ]
    } catch {
      return [
        { id: 'todos', name: 'Todos', icon: '📋' }
      ]
    }
  },

  /**
   * Reservar un servicio
   */
  reservarServicio: async (servicioId, bookingData) => {
    const response = await api.post(`/services/${servicioId}/book`, bookingData)
    return {
      success: true,
      reservationId: response.data.bookingId || response.data.id,
      servicio: response.data.service,
      pointsEarned: response.data.pointsEarned || 0,
      message: response.message || 'Reserva realizada exitosamente'
    }
  },

  /**
   * Verificar si el usuario tiene suficientes puntos (lógica local)
   */
  canUseService: (service, userPoints) => {
    return userPoints >= (service.pointsRequired || 0)
  },

  /**
   * Buscar servicios
   */
  searchServicios: async (query) => {
    const services = await serviciosService.getServicios()
    const lowerQuery = query.toLowerCase()
    return services.filter(service =>
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description?.toLowerCase().includes(lowerQuery)
    )
  }
}