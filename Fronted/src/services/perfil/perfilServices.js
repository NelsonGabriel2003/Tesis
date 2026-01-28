/**
 * Perfil Services
 * Servicios para el módulo de perfil - Conectado al Backend
 */

import api from '../api.js'

// Cache para configuración de membresías (evita llamadas repetidas)
let membershipConfigCache = null

export const perfilService = {
  /**
   * Obtener configuración de membresías desde la API
   */
  getMembershipConfig: async () => {
    if (membershipConfigCache) {
      return membershipConfigCache
    }

    try {
      const result = await api.get('/config/membership')
      membershipConfigCache = result.data.levels
      return membershipConfigCache
    } catch {
      // Fallback si la API falla
      return {
        bronce: { name: 'Bronce', icon: '🥉', color: 'bg-amber-600', minPoints: 0, multiplier: 1 },
        plata: { name: 'Plata', icon: '🥈', color: 'bg-gray-400', minPoints: 500, multiplier: 1.5 },
        oro: { name: 'Oro', icon: '🥇', color: 'bg-yellow-500', minPoints: 1500, multiplier: 2 },
        platino: { name: 'Platino', icon: '💎', color: 'bg-purple-500', minPoints: 5000, multiplier: 3 }
      }
    }
  },

  /**
   * Limpiar cache de configuración (útil si el admin actualiza config)
   */
  clearConfigCache: () => {
    membershipConfigCache = null
  },

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
      role: data.role || 'user',
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
   * Actualizar datos del usuario
   */
  updateUserProfile: async (userData) => {
    const result = await api.put('/profile', {
      name: userData.name,
      phone: userData.phone
    })

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
   * Obtener nivel de membresía según puntos
   */
  getMembershipLevel: async (points) => {
    const levels = await perfilService.getMembershipConfig()
    
    if (points >= levels.platino.minPoints) return levels.platino
    if (points >= levels.oro.minPoints) return levels.oro
    if (points >= levels.plata.minPoints) return levels.plata
    return levels.bronce
  },

  /**
   * Calcular progreso al siguiente nivel
   */
  getProgressToNextLevel: async (currentPoints) => {
    const levels = await perfilService.getMembershipConfig()
    
    const levelOrder = [
      { key: 'bronce', ...levels.bronce },
      { key: 'plata', ...levels.plata },
      { key: 'oro', ...levels.oro },
      { key: 'platino', ...levels.platino }
    ]

    const currentLevelIndex = levelOrder.findIndex((l, i) => {
      const nextLevel = levelOrder[i + 1]
      return !nextLevel || currentPoints < nextLevel.minPoints
    })

    const nextLevel = levelOrder[currentLevelIndex + 1]

    if (!nextLevel) {
      return { percentage: 100, pointsNeeded: 0, nextLevelName: 'Máximo' }
    }

    const currentLevelMin = levelOrder[currentLevelIndex].minPoints
    const pointsInLevel = currentPoints - currentLevelMin
    const pointsForNextLevel = nextLevel.minPoints - currentLevelMin
    const percentage = Math.min((pointsInLevel / pointsForNextLevel) * 100, 100)

    return {
      percentage,
      pointsNeeded: nextLevel.minPoints - currentPoints,
      nextLevelName: nextLevel.name
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
