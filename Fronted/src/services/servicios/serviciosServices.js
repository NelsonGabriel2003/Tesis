/**
 * Servicios Services
 * Servicios para el módulo de servicios (mock sin base de datos)
 */

import { mockServicios, serviciosCategorias } from '../../models/servicios/serviciosModel'

// Simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const serviciosService = {
  /**
   * Obtener todos los servicios
   */
  getServicios: async () => {
    await delay(500)
    return mockServicios
  },

  /**
   * Obtener servicios por categoría
   */
  getServiciosByCategory: async (categoryId) => {
    await delay(300)
    if (categoryId === 'todos') {
      return mockServicios
    }
    return mockServicios.filter(service => service.category === categoryId)
  },

  /**
   * Obtener un servicio por ID
   */
  getServicioById: async (id) => {
    await delay(200)
    return mockServicios.find(service => service.id === id) || null
  },

  /**
   * Obtener categorías
   */
  getCategorias: async () => {
    await delay(100)
    return serviciosCategorias
  },

  /**
   * Reservar un servicio
   */
  reservarServicio: async (servicioId, userData) => {
    await delay(800)
    const servicio = mockServicios.find(s => s.id === servicioId)

    if (!servicio) {
      throw new Error('Servicio no encontrado')
    }

    if (!servicio.available) {
      throw new Error('Servicio no disponible')
    }

    // Simular reserva exitosa
    return {
      success: true,
      reservationId: `RES-${Date.now()}`,
      servicio: servicio,
      pointsEarned: servicio.pointsReward,
      message: 'Reserva realizada exitosamente'
    }
  },

  /**
   * Verificar si el usuario tiene suficientes puntos
   */
  canUseService: (service, userPoints) => {
    return userPoints >= service.pointsRequired
  }
}
