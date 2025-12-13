/**
 * useServiceController
 * Controlador para gestión de servicios en el panel admin
 */

import { useState, useCallback, useEffect } from 'react'
import { serviceService } from '../../services/admin/adminServices'
import { initialServiceState, initialServiceForm, adminMessages } from '../../models/admin/adminModel'

export const useServiceController = () => {
  const [state, setState] = useState(initialServiceState)
  const [formData, setFormData] = useState(initialServiceForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [notification, setNotification] = useState(null)

  /**
   * Cargar todos los servicios
   */
  const loadServices = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const services = await serviceService.getAll()
      setState(prev => ({
        ...prev,
        services,
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

  /**
   * Cargar categorías
   */
  const loadCategories = useCallback(async () => {
    try {
      const categories = await serviceService.getCategories()
      setState(prev => ({ ...prev, categories }))
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }, [])

  /**
   * Cargar datos al montar
   */
  useEffect(() => {
    loadServices()
    loadCategories()
  }, [loadServices, loadCategories])

  /**
   * Manejar cambios en el formulario
   */
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }, [])

  /**
   * Abrir modal para crear
   */
  const openCreateModal = useCallback(() => {
    setFormData(initialServiceForm)
    setIsEditing(false)
    setIsModalOpen(true)
  }, [])

  /**
   * Abrir modal para editar
   */
  const openEditModal = useCallback((service) => {
    setFormData({
      name: service.name || '',
      description: service.description || '',
      points_required: service.pointsRequired?.toString() || '0',
      points_earned: service.pointsEarned?.toString() || '0',
      category: service.category || '',
      image_url: service.imageUrl || ''
    })
    setState(prev => ({ ...prev, selectedService: service }))
    setIsEditing(true)
    setIsModalOpen(true)
  }, [])

  /**
   * Cerrar modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setFormData(initialServiceForm)
    setState(prev => ({ ...prev, selectedService: null }))
  }, [])

  /**
   * Mostrar notificación
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  /**
   * Guardar servicio (crear o actualizar)
   */
  const saveService = useCallback(async (e) => {
    e.preventDefault()
    
    // Validar campos requeridos
    if (!formData.name || !formData.category) {
      showNotification(adminMessages.REQUIRED_FIELDS, 'error')
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        points_required: parseInt(formData.points_required) || 0,
        points_earned: parseInt(formData.points_earned) || 0,
        category: formData.category,
        image_url: formData.image_url
      }

      if (isEditing && state.selectedService) {
        await serviceService.update(state.selectedService.id, serviceData)
        showNotification(adminMessages.SERVICE_UPDATED)
      } else {
        await serviceService.create(serviceData)
        showNotification(adminMessages.SERVICE_CREATED)
      }

      closeModal()
      loadServices()
    } catch (error) {
      showNotification(error.message || adminMessages.SERVICE_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [formData, isEditing, state.selectedService, closeModal, loadServices, showNotification])

  /**
   * Eliminar servicio
   */
  const deleteService = useCallback(async (id) => {
    if (!window.confirm(adminMessages.CONFIRM_DELETE)) {
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      await serviceService.update(id, { is_available: false })
      showNotification(adminMessages.SERVICE_DELETED)
      loadServices()
    } catch (error) {
      showNotification(error.message || adminMessages.SERVICE_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [loadServices, showNotification])

  return {
    // Estado
    ...state,
    formData,
    isModalOpen,
    isEditing,
    notification,

    // Acciones
    loadServices,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    saveService,
    deleteService
  }
}
