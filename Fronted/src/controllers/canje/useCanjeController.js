/**
 * Canje Controller
 * Custom hook para manejar la lógica del módulo de canje
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialCanjeState, canjeCategories } from '../../models/canje/canjeModel'
import { canjeService } from '../../services/canje/canjeServices'

export const useCanjeController = () => {
  const [state, setState] = useState(initialCanjeState)
  const [categories] = useState(canjeCategories)
  const [selectedReward, setSelectedReward] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [redeemStatus, setRedeemStatus] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Puntos del usuario desde backend
  const [userPoints, setUserPoints] = useState(0)
  const [loadingPoints, setLoadingPoints] = useState(true)

  const navigate = useNavigate()

  // Cargar puntos del usuario
  const loadUserPoints = useCallback(async () => {
    setLoadingPoints(true)
    try {
      const points = await canjeService.getUserPoints()
      setUserPoints(points)
    } catch (error) {
      console.error('Error cargando puntos:', error)
      // Intentar obtener del localStorage como fallback
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        setUserPoints(user.points?.current || 0)
      }
    } finally {
      setLoadingPoints(false)
    }
  }, [])

  // Cargar recompensas
  const loadRewards = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const rewards = await canjeService.getRewards()
      setState(prev => ({
        ...prev,
        rewards,
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [])

  // Filtrar por categoría
  const filterByCategory = useCallback(async (categoryId) => {
    setState(prev => ({ ...prev, loading: true, selectedCategory: categoryId }))

    try {
      const rewards = await canjeService.getRewardsByCategory(categoryId)
      setState(prev => ({
        ...prev,
        rewards,
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [])

  // Buscar recompensas
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)

    if (!query.trim()) {
      loadRewards()
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      const rewards = await canjeService.searchRewards(query)
      setState(prev => ({
        ...prev,
        rewards,
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [loadRewards])

  // Seleccionar recompensa para ver detalles
  const selectReward = useCallback((reward) => {
    setSelectedReward(reward)
    setShowModal(true)
    setRedeemStatus(null)
  }, [])

  // Cerrar modal
  const closeModal = useCallback(() => {
    setShowModal(false)
    setSelectedReward(null)
    setRedeemStatus(null)
  }, [])

  // Canjear recompensa
  const redeemReward = useCallback(async (rewardId) => {
    setRedeemStatus({ loading: true, error: null, success: false })

    try {
      const result = await canjeService.redeemReward(rewardId)
      setUserPoints(result.newBalance)
      
      // Actualizar puntos en localStorage
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        user.points = { ...user.points, current: result.newBalance }
        localStorage.setItem('user', JSON.stringify(user))
      }

      setRedeemStatus({
        loading: false,
        error: null,
        success: true,
        data: result
      })
    } catch (error) {
      setRedeemStatus({
        loading: false,
        error: error.message,
        success: false
      })
    }
  }, [])

  // Verificar si puede canjear
  const canRedeem = useCallback((reward) => {
    return canjeService.canRedeem(reward, userPoints)
  }, [userPoints])

  // Volver al main
  const goBack = useCallback(() => {
    navigate('/main')
  }, [navigate])

  // Cargar datos al montar
  useEffect(() => {
    loadUserPoints()
    loadRewards()
  }, [loadUserPoints, loadRewards])

  return {
    // Estado
    rewards: state.rewards,
    loading: state.loading || loadingPoints,
    error: state.error,
    selectedCategory: state.selectedCategory,
    categories,
    selectedReward,
    showModal,
    redeemStatus,
    searchQuery,
    userPoints,

    // Acciones
    filterByCategory,
    handleSearch,
    selectReward,
    closeModal,
    redeemReward,
    canRedeem,
    goBack,
    loadRewards
  }
}
