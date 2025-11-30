/**
 * Perfil Controller
 * Custom hook para manejar la lógica del módulo perfil
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialPerfilState, membershipLevels } from '../../models/perfil/perfilModel'
import { perfilService } from '../../services/perfil/perfilServices'

export const usePerfilController = () => {
  const [state, setState] = useState(initialPerfilState)
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'points' | 'stats'
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})

  const navigate = useNavigate()

  // Cargar perfil del usuario
  const loadUserProfile = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const user = await perfilService.getUserProfile()
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
      const updatedUser = await perfilService.updateUserProfile(editData)
      setState(prev => ({
        ...prev,
        user: updatedUser,
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

  // Manejar cambios en el formulario de edición
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

  // Obtener nivel de membresía
  const getMembershipInfo = useCallback(() => {
    if (!state.user) return null
    return perfilService.getMembershipLevel(state.user.points.total)
  }, [state.user])

  // Obtener progreso al siguiente nivel
  const getProgress = useCallback(() => {
    if (!state.user) return null
    return perfilService.getProgressToNextLevel(state.user.points.total)
  }, [state.user])

  // Formatear fecha
  const formatDate = useCallback((dateString) => {
    return perfilService.formatDate(dateString)
  }, [])

  // Cerrar sesión
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }, [navigate])

  // Volver al main
  const goBack = useCallback(() => {
    navigate('/main')
  }, [navigate])

  // Cargar perfil al montar
  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  return {
    // Estado
    user: state.user,
    loading: state.loading,
    error: state.error,
    activeTab,
    isEditing,
    editData,
    membershipLevels,

    // Datos calculados
    membershipInfo: getMembershipInfo(),
    progress: getProgress(),

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
