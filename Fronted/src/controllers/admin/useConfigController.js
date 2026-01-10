/**
 * useConfigController
 * Controlador para gestión de configuración en el panel admin
 */

import { useState, useCallback, useEffect } from 'react'
import { configService } from '../../services/admin/adminServices'

export const useConfigController = () => {
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [editedValues, setEditedValues] = useState({})

  /**
   * Cargar todas las configuraciones
   */
  const loadConfigs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await configService.getAll()
      setConfigs(data)
      
      // Inicializar valores editados
      const initial = {}
      data.forEach(config => {
        initial[config.key] = config.value
      })
      setEditedValues(initial)
    } catch (err) {
      setError(err.message || 'Error al cargar configuraciones')
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Cargar al montar
   */
  useEffect(() => {
    loadConfigs()
  }, [loadConfigs])

  /**
   * Mostrar notificación
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  /**
   * Manejar cambio de valor
   */
  const handleValueChange = useCallback((key, value) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  /**
   * Verificar si hay cambios sin guardar
   */
  const hasChanges = useCallback(() => {
    return configs.some(config => config.value !== editedValues[config.key])
  }, [configs, editedValues])

  /**
   * Obtener configuraciones modificadas
   */
  const getModifiedConfigs = useCallback(() => {
    return configs
      .filter(config => config.value !== editedValues[config.key])
      .map(config => ({
        key: config.key,
        value: editedValues[config.key]
      }))
  }, [configs, editedValues])

  /**
   * Guardar cambios
   */
  const saveChanges = useCallback(async () => {
    const modified = getModifiedConfigs()
    
    if (modified.length === 0) {
      showNotification('No hay cambios para guardar', 'info')
      return
    }

    setSaving(true)

    try {
      await configService.updateMany(modified)
      showNotification(`${modified.length} configuración(es) actualizada(s)`)
      loadConfigs()
    } catch (err) {
      showNotification(err.message || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }, [getModifiedConfigs, loadConfigs, showNotification])

  /**
   * Descartar cambios
   */
  const discardChanges = useCallback(() => {
    const initial = {}
    configs.forEach(config => {
      initial[config.key] = config.value
    })
    setEditedValues(initial)
    showNotification('Cambios descartados', 'info')
  }, [configs, showNotification])

  /**
   * Agrupar configuraciones por categoría
   */
  const groupedConfigs = useCallback(() => {
    const groups = {}
    configs.forEach(config => {
      const category = config.category || 'general'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(config)
    })
    return groups
  }, [configs])

  /**
   * Obtener nombre legible de categoría
   */
  const getCategoryName = (category) => {
    const names = {
      'points': '💰 Configuración de Puntos',
      'membership': '🏆 Niveles de Membresía',
      'general': '⚙️ General'
    }
    return names[category] || category
  }

  /**
   * Obtener nombre legible de configuración
   */
  const getConfigLabel = (key) => {
    const labels = {
      'points_per_dollar': 'Puntos por cada $1',
      'points_expiration_days': 'Días para expiración de puntos',
      'multiplier_bronce': 'Multiplicador Bronce',
      'multiplier_plata': 'Multiplicador Plata',
      'multiplier_oro': 'Multiplicador Oro',
      'multiplier_platino': 'Multiplicador Platino',
      'threshold_bronce': 'Puntos mínimos Bronce',
      'threshold_plata': 'Puntos mínimos Plata',
      'threshold_oro': 'Puntos mínimos Oro',
      'threshold_platino': 'Puntos mínimos Platino',
      'icon_bronce': 'Ícono Bronce',
      'icon_plata': 'Ícono Plata',
      'icon_oro': 'Ícono Oro',
      'icon_platino': 'Ícono Platino',
      'color_bronce': 'Color Bronce',
      'color_plata': 'Color Plata',
      'color_oro': 'Color Oro',
      'color_platino': 'Color Platino'
    }
    return labels[key] || key
  }

  /**
   * Determinar tipo de input según la key
   */
  const getInputType = (key) => {
    if (key.includes('multiplier') || key.includes('points') || key.includes('threshold') || key.includes('days')) {
      return 'number'
    }
    if (key.includes('icon')) {
      return 'emoji'
    }
    if (key.includes('color')) {
      return 'color'
    }
    return 'text'
  }

  return {
    // Estado
    configs,
    loading,
    saving,
    error,
    notification,
    editedValues,

    // Acciones
    loadConfigs,
    handleValueChange,
    saveChanges,
    discardChanges,
    hasChanges,

    // Helpers
    groupedConfigs,
    getCategoryName,
    getConfigLabel,
    getInputType
  }
}
