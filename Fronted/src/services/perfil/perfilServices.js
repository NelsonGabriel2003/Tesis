/**
 * Perfil Services
 * Servicios para el módulo de perfil - Conectado al Backend
 */

import { membershipLevels } from '../../models/perfil/perfilModel'
import api from '../api.js'

export const perfilService = {
  /**
   * Obtener datos del usuario desde el backend
   */
  getUserProfile: async () => {
    const result = await api.get('/profile')
    const data = result.data

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
  },

  /**
   * Obtener puntos para el siguiente nivel (lógica local)
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
    const result = await api.put('/profile', {
      name: userData.name,
      phone: userData.phone
    })

    const data = result.data || result.user

    // Actualizar localStorage (lógica de negocio, NO va en api.js)
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
  },

  /**
   * Obtener historial de transacciones
   */
  getPointsHistory: async () => {
    try {
      const result = await api.get('/profile/transactions')
      const transactions = result.data || result.transactions || []

      return transactions.map(t => ({
        id: t.id,
        type: t.type,
        points: t.points,
        description: t.description,
        date: t.created_at,
        referenceType: t.reference_type,
        referenceId: t.reference_id
      }))
    } catch {
      return []
    }
  },

  /**
   * Obtener estadísticas
   */
  getStats: async () => {
    try {
      const result = await api.get('/profile/stats')
      const data = result.data

      return {
        totalVisits: data.orders?.totalVisits || 0,
        totalSpent: data.orders?.totalSpent || 0,
        favoriteItem: data.orders?.favoriteItem || '-',
        lastVisit: data.orders?.lastVisit || null
      }
    } catch {
      return null
    }
  },

  /**
   * Obtener nivel de membresía (lógica local)
   */
  getMembershipLevel: (points) => {
    if (points >= 5000) return membershipLevels.platinum
    if (points >= 1500) return membershipLevels.gold
    if (points >= 500) return membershipLevels.silver
    return membershipLevels.bronze
  },

  /**
   * Calcular progreso al siguiente nivel (lógica local)
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
   * Formatear fecha (lógica local)
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