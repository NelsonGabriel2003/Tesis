/**
 * Perfil Controller
 * Custom hook para manejar la lógica del módulo perfil
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialPerfilState, defaultMembershipLevels } from '../../models/perfil/perfilModel'
import { perfilService } from '../../services/perfil/perfilServices'
import { validaciones, mensajesRegistro, limiteCampos } from '../../models/auth/authModel'

export const usePerfilController = () => {
  const [state, setState] = useState(initialPerfilState)
  const [membershipLevels, setMembershipLevels] = useState(defaultMembershipLevels)
  const [activeTab, setActiveTab] = useState('info')
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [fieldErrors, setFieldErrors] = useState({})

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

  // Validar un campo individual
  const validarCampo = useCallback((name, value) => {
    switch (name) {
      case 'name':
        if (!value || !value.trim()) return 'El nombre es requerido'
        if (!validaciones.nombre.test(value)) return mensajesRegistro.NOMBRE_INVALIDO
        if (value.trim().length < validaciones.nombreMinimo) return mensajesRegistro.NOMBRE_CORTO
        if (value.trim().split(/\s+/).length < 2) return mensajesRegistro.NOMBRE_INCOMPLETO
        return null
      case 'phone':
        if (value && value.length > 0 && !/^[0-9]*$/.test(value)) return 'Solo se permiten numeros'
        if (value && value.length >= 1 && value[0] !== '0') return 'Debe comenzar con 09'
        if (value && value.length >= 2 && value[1] !== '9') return 'Debe comenzar con 09'
        if (value && value.length > 0 && value.length < 10) return 'El telefono debe tener 10 digitos'
        if (value && value.length === 10 && !validaciones.telefono.test(value)) return mensajesRegistro.TELEFONO_INVALIDO
        return null
      default:
        return null
    }
  }, [])

  // Validar todo el formulario antes de guardar
  const validarFormulario = useCallback(() => {
    const errores = {}

    const errorName = validarCampo('name', editData.name)
    if (errorName) errores.name = errorName

    const errorPhone = validarCampo('phone', editData.phone)
    if (errorPhone) errores.phone = errorPhone

    setFieldErrors(errores)
    return Object.keys(errores).length === 0
  }, [editData, validarCampo])

  // Manejar cambios en el formulario con validacion en tiempo real
  const handleEditChange = useCallback((field, value) => {
    // Aplicar limite de caracteres
    if (field === 'name' && value.length > limiteCampos.nombre) return
    if (field === 'phone' && value.length > limiteCampos.telefono) return

    // Capitalizar cada palabra del nombre
    let valorFinal = value
    if (field === 'name') {
      valorFinal = value.replace(/\b[a-záéíóúñü]/g, c => c.toUpperCase())
    }

    setEditData(prev => ({
      ...prev,
      [field]: valorFinal
    }))

    const error = validarCampo(field, valorFinal)
    setFieldErrors(prev => ({ ...prev, [field]: error }))
  }, [validarCampo])

  // Actualizar perfil
  const updateProfile = useCallback(async () => {
    if (!validarFormulario()) return

    setState(prev => ({ ...prev, loading: true, error: null }))

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
      setFieldErrors({})
    } catch (error) {
      const msg = error.message || ''
      if (error.field === 'phone' || msg.includes('telefono') || msg.includes('numero')) {
        setFieldErrors(prev => ({ ...prev, phone: msg }))
        setState(prev => ({ ...prev, loading: false }))
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: msg
        }))
      }
    }
  }, [editData, validarFormulario])

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
    setFieldErrors({})
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
    fieldErrors,
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