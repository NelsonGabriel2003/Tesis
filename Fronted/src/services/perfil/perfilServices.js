/**
 * Perfil Services
 * Servicios para el módulo de perfil (mock sin base de datos)
 */

import { mockUserData, membershipLevels } from '../../models/perfil/perfilModel'

// Simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const perfilService = {
  /**
   * Obtener datos del usuario
   */
  getUserProfile: async () => {
    await delay(500)
    return mockUserData
  },

  /**
   * Actualizar datos del usuario
   */
  updateUserProfile: async (userData) => {
    await delay(800)
    // Simular actualización
    return {
      ...mockUserData,
      ...userData,
      updatedAt: new Date().toISOString()
    }
  },

  /**
   * Obtener historial de puntos
   */
  getPointsHistory: async () => {
    await delay(300)
    return mockUserData.points.history
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
   * Obtener estadísticas del usuario
   */
  getUserStats: async () => {
    await delay(200)
    return mockUserData.stats
  },

  /**
   * Formatear fecha
   */
  formatDate: (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
}
