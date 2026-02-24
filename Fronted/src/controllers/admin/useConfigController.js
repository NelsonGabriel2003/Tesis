/**
 * useConfigController
 * Controlador para gestión de configuración en el panel admin
 */

import { useState, useCallback, useEffect } from 'react'
import { configService } from '../../services/admin/adminServices'
import { reglasConfig } from '../../models/admin/adminModel'
import { useFormValidation } from '../../hooks/useFormValidation'

export const useConfigController = () => {
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [editedValues, setEditedValues] = useState({})
  const { fieldErrors, tieneErrores, validarCampo, validarFormulario, limpiarErrores } = useFormValidation(reglasConfig)

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
    validarCampo(key, value)
  }, [validarCampo])

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
    // Validar campos numéricos antes de guardar
    if (!validarFormulario(editedValues)) {
      return
    }

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
    limpiarErrores()
    showNotification('Cambios descartados', 'info')
  }, [configs, showNotification, limpiarErrores])

  /**
   * Agrupar configuraciones por categoría
   */
  const groupedConfigs = useCallback(() => {
    const groups = {}
    // Filtrar keys gestionadas en otras secciones (ej: whatsapp_reservas en Servicios)
    const keysExcluidas = ['whatsapp_reservas']
    configs
      .filter(config => !keysExcluidas.includes(config.key))
      .forEach(config => {
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
      'puntos': '💰 Configuración de Puntos',
      'membresia': '🏆 Niveles de Membresía',
      'general': '⚙️ General'
    }
    return names[category] || category
  }

  /**
   * Obtener nombre legible de configuración
   * Coincide con las claves de la BD (umbral_*, multiplicador_*, etc.)
   */
  const getConfigLabel = (key) => {
    const labels = {
      // Puntos
      'puntos_por_dolar': 'Puntos por cada $1',
      
      // Umbrales de membresía
      'umbral_plata': 'Puntos mínimos para Plata',
      'umbral_oro': 'Puntos mínimos para Oro',
      'umbral_platino': 'Puntos mínimos para Platino',
      
      // Multiplicadores
      'multiplicador_plata': 'Multiplicador Plata',
      'multiplicador_oro': 'Multiplicador Oro',
      'multiplicador_platino': 'Multiplicador Platino',
      
      // Iconos (si los agregas después)
      'icon_bronce': 'Ícono Bronce',
      'icon_plata': 'Ícono Plata',
      'icon_oro': 'Ícono Oro',
      'icon_platino': 'Ícono Platino',
      
      // Colores (si los agregas después)
      'color_bronce': 'Color Bronce',
      'color_plata': 'Color Plata',
      'color_oro': 'Color Oro',
      'color_platino': 'Color Platino'
    }
    return labels[key] || key.replace(/_/g, ' ')
  }

  /**
   * Determinar tipo de input según la key
   */
  const getInputType = (key) => {
    if (key.includes('multiplicador') || key.includes('puntos') || key.includes('umbral')) {
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
    fieldErrors,
    tieneErrores,

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