/**
 * useDashboardController
 * Controlador para el dashboard del administrador
 */

import { useState, useCallback, useEffect } from 'react'
import { statsService } from '../../services/admin/adminServices'

// Estado inicial
const initialState = {
  stats: null,
  loading: true,
  error: null
}

export const useDashboardController = () => {
  const [state, setState] = useState(initialState)

  /**
   * Cargar estadísticas del dashboard
   */
  const loadStats = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const stats = await statsService.getSummary()
      setState({
        stats,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
      setState({
        stats: null,
        loading: false,
        error: error.message || 'Error al cargar estadísticas'
      })
    }
  }, [])

  /**
   * Cargar dashboard completo
   */
  const loadFullDashboard = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const stats = await statsService.getDashboard()
      setState({
        stats,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error cargando dashboard:', error)
      setState({
        stats: null,
        loading: false,
        error: error.message || 'Error al cargar dashboard'
      })
    }
  }, [])

  /**
   * Refrescar estadísticas
   */
  const refresh = useCallback(() => {
    loadStats()
  }, [loadStats])

  /**
   * Cargar al montar
   */
  useEffect(() => {
    loadStats()
  }, [loadStats])

  return {
    // Estado
    stats: state.stats,
    loading: state.loading,
    error: state.error,

    // Acciones
    loadStats,
    loadFullDashboard,
    refresh
  }
}
