/**
 * Perfil Controller
 * Custom hook para manejar la lógica del módulo perfil
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialPerfilState, defaultMembershipLevels } from '../../models/perfil/perfilModel'
import { perfilService } from '../../services/perfil/perfilServices'

export const usePerfilController = () => {
  const [state, setState] = useState(initialPerfilState)
  const [membershipLevels, setMembershipLevels] = useState(defaultMembershipLevels)
  const [activeTab, setActiveTab] = useState('info')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})

  const navigate = useNavigate()

  // Cargar configuración de membresía desde la BD
  const loadMembershipConfig = useCallback(async () => {
    try {
      const config = await perfilService.getMembershipConfig()
      if (config) {
        setMembershipLevels(config)
      }
    } catch (error) {
      console.error('Error cargando config de membresía, usando valores por defecto:', error)
      // Mantiene defaultMembershipLevels
    }
  }, [])

  // Cargar perfil del usuario
  const loadUserProfile = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Cargar datos en paralelo
      const [userData, statsData, historial] = await Promise.all([
        perfilService.getUserProfile(),
        perfilService.getStats(),
        perfilService.getPointsHistory()
      ])

      const user = {
        ...userData,
        points: {
          ...userData.points,
          history: historial
        },
        stats: statsData || {
          totalVisits: 0,
          totalSpent: 0,
          favoriteItem: '-',
          lastVisit: null
        }
      }

      setState(prev => ({
        ...prev,
        user,
        loading: false
      }))

      setEditData({
        name: user.name,
        email: user.email,
        phone: user.phone
      })

      // Actualizar localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        points: user.points,
        membershipLevel: user.membership?.level || user.membershipLevel
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [])

  // Actualizar perfil
  const updateProfile = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      const datosActualizados = await perfilService.updateUserProfile(editData)
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...datosActualizados
        },
        loading: false
      }))
      setIsEditing(false)
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [editData])

  // Manejar cambios en el formulario
  const handleEditChange = useCallback((field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // Cancelar edición
  const cancelEdit = useCallback(() => {
    if (state.user) {
      setEditData({
        name: state.user.name,
        email: state.user.email,
        phone: state.user.phone
      })
    }
    setIsEditing(false)
  }, [state.user])

  // Calcular membershipInfo de forma síncrona usando los niveles cargados
  const membershipInfo = useMemo(() => {
    if (!state.user) return null
    
    const totalPoints = state.user.points?.total || 0
    const levels = membershipLevels
    
    if (totalPoints >= levels.platino.minPoints) return levels.platino
    if (totalPoints >= levels.oro.minPoints) return levels.oro
    if (totalPoints >= levels.plata.minPoints) return levels.plata
    return levels.bronce
  }, [state.user, membershipLevels])

  // Calcular progreso de forma síncrona
  const progress = useMemo(() => {
    if (!state.user) return null
    
    const currentPoints = state.user.points?.total || 0
    const levels = membershipLevels
    
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
  }, [state.user, membershipLevels])

  // Formatear fecha
  const formatDate = useCallback((dateString) => {
    return perfilService.formatDate(dateString)
  }, [])

  // Cerrar sesión
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    perfilService.clearConfigCache() // Limpiar cache de membresía
    navigate('/login')
  }, [navigate])

  // Volver al main
  const goBack = useCallback(() => {
    navigate('/main')
  }, [navigate])

  // Cargar al montar
  useEffect(() => {
    loadMembershipConfig()
    loadUserProfile()
  }, [loadMembershipConfig, loadUserProfile])

  return {
    // Estado
    user: state.user,
    loading: state.loading,
    error: state.error,
    activeTab,
    isEditing,
    editData,
    membershipLevels,

    // Datos calculados (ahora son síncronos)
    membershipInfo,
    progress,

    // Acciones
    setActiveTab,
    setIsEditing,
    handleEditChange,
    updateProfile,
    cancelEdit,
    formatDate,
    handleLogout,
    goBack,
    loadUserProfile
  }
}