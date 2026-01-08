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
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: getHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener perfil')
      }

      const result = await response.json()
      const data = result.data

      // Transformar respuesta del backend al formato esperado
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        avatar: null,
        memberSince: data.memberSince,
        membershipLevel: data.membership?.level?.toLowerCase() || 'bronce',
        membership: {
          level: data.membership?.level?.toLowerCase() || 'bronce',
          progress: data.membership?.progress || 0,
          pointsToNextLevel: data.membership?.pointsToNextLevel || 500,
          nextLevel: data.membership?.nextLevel || 'plata'
        },
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
    } catch (error) {
      console.error('Error en getUserProfile:', error)
      throw error
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
    try {
      const response = await fetch(`${API_URL}/profile`, {
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

      const result = await response.json()
      const data = result.data || result.user

      // Actualizar localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUser = {
        ...storedUser,
        name: data.name,
        phone: data.phone
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || ''
      }
    } catch (error) {
      console.error('Error en updateUserProfile:', error)
      throw error
    }
  },

  /**
   * Obtener historial de transacciones
   */
  getPointsHistory: async () => {
    try {
      const response = await fetch(`${API_URL}/profile/transactions`, {
        method: 'GET',
        headers: getHeaders()
      })

      if (!response.ok) {
        return []
      }

      const result = await response.json()
      
      // Mapear transacciones al formato esperado
      const transactions = result.data || result.transactions || []
      
      return transactions.map(t => ({
        id: t.id,
        type: t.type, // 'earned' | 'redeemed'
        points: t.points,
        description: t.description,
        date: t.created_at,
        referenceType: t.reference_type,
        referenceId: t.reference_id
      }))
    } catch (error) {
      console.error('Error en getPointsHistory:', error)
      return []
    }
  },

  getStats: async () => {
  try {
    const response = await fetch(`${API_URL}/profile/stats`, {
      method: 'GET',
      headers: getHeaders()
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    const data = result.data

    return {
      totalVisits: data.orders?.totalVisits || 0,
      totalSpent: data.orders?.totalSpent || 0,
      favoriteItem: data.orders?.favoriteItem || '-',
      lastVisit: data.orders?.lastVisit || null
    }
  } catch (error) {
    console.error('Error en getStats:', error)
    return null
  }
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
      nextLevelName: membershipLevels[nextLevel.level]?.name || nextLevel.level
    }
  },

  /**
   * Formatear fecha
   */
  formatDate: (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }
}