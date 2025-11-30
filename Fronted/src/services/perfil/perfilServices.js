/**
 * Perfil Services
 * Servicios para el módulo de perfil - Conectado al Backend
 */

import { membershipLevels } from '../../models/perfil/perfilModel'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Helper para obtener headers con token
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

export const perfilService = {
  /**
   * Obtener datos del usuario desde el backend
   */
  getUserProfile: async () => {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al obtener perfil')
    }

    const result = await response.json()
    const data = result.data  // ← Backend devuelve { success, data }
    
    // Transformar respuesta del backend al formato esperado por el frontend
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      avatar: null,
      memberSince: data.memberSince,
      membershipLevel: data.membership?.level?.toLowerCase() || 'bronce',
      points: {
        current: data.points?.current || 0,
        total: data.points?.total || 0,
        nextLevel: perfilService.getNextLevelPoints(data.points?.total || 0),
        history: []
      },
      stats: {
        totalVisits: 0,
        totalSpent: 0,
        favoriteItem: '-',
        lastVisit: data.memberSince
      }
    }
  },

  /**
   * Obtener puntos para el siguiente nivel
   */
  getNextLevelPoints: (currentPoints) => {
    if (currentPoints < 500) return 500
    if (currentPoints < 1500) return 1500
    if (currentPoints < 5000) return 5000
    return 5000
  },

  /**
   * Actualizar datos del usuario
   */
  updateUserProfile: async (userData) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        name: userData.name,
        phone: userData.phone
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al actualizar perfil')
    }

    const data = await response.json()
    
    // Actualizar localStorage con nuevos datos
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const updatedUser = { ...storedUser, name: data.user.name, phone: data.user.phone }
    localStorage.setItem('user', JSON.stringify(updatedUser))

    // Retornar en el formato esperado
    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone || '',
      avatar: null,
      memberSince: storedUser.createdAt || new Date().toISOString(),
      membershipLevel: data.user.membershipLevel?.toLowerCase() || 'bronce',
      points: {
        current: data.user.points?.current || 0,
        total: data.user.points?.total || 0,
        nextLevel: perfilService.getNextLevelPoints(data.user.points?.total || 0),
        history: []
      },
      stats: {
        totalVisits: 0,
        totalSpent: 0,
        favoriteItem: '-',
        lastVisit: new Date().toISOString()
      }
    }
  },

  /**
   * Obtener historial de transacciones
   */
  getPointsHistory: async () => {
    const response = await fetch(`${API_URL}/profile/transactions`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.transactions || []
  },

  /**
   * Obtener nivel de membresía
   */
  getMembershipLevel: (points) => {
    if (points >= 5000) return membershipLevels.platinum
    if (points >= 1500) return membershipLevels.gold
    if (points >= 500) return membershipLevels.silver
    return membershipLevels.bronze
  },

  /**
   * Calcular progreso al siguiente nivel
   */
  getProgressToNextLevel: (currentPoints) => {
    const levels = [
      { level: 'bronze', min: 0 },
      { level: 'silver', min: 500 },
      { level: 'gold', min: 1500 },
      { level: 'platinum', min: 5000 }
    ]

    const currentLevelIndex = levels.findIndex((l, i) => {
      const nextLevel = levels[i + 1]
      return !nextLevel || currentPoints < nextLevel.min
    })

    const nextLevel = levels[currentLevelIndex + 1]

    if (!nextLevel) {
      return { percentage: 100, pointsNeeded: 0, nextLevelName: 'Máximo' }
    }

    const currentLevelMin = levels[currentLevelIndex].min
    const pointsInLevel = currentPoints - currentLevelMin
    const pointsForNextLevel = nextLevel.min - currentLevelMin
    const percentage = Math.min((pointsInLevel / pointsForNextLevel) * 100, 100)

    return {
      percentage,
      pointsNeeded: nextLevel.min - currentPoints,
      nextLevelName: membershipLevels[nextLevel.level].name
    }
  },

  /**
   * Formatear fecha
   */
  formatDate: (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
}