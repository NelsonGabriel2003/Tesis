/**
 * useRewardController
 * Controlador para gestión de recompensas en el panel admin
 */

import { useState, useCallback, useEffect } from 'react'
import { rewardService } from '../../services/admin/adminServices'
import { initialRewardState, initialRewardForm, adminMessages, reglasRecompensa } from '../../models/admin/adminModel'
import { useFormValidation } from '../../hooks/useFormValidation'

export const useRewardController = () => {
  const [state, setState] = useState(initialRewardState)
  const [formData, setFormData] = useState(initialRewardForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [notification, setNotification] = useState(null)
  const { fieldErrors, tieneErrores, validarCampo, validarFormulario, limpiarErrores } = useFormValidation(reglasRecompensa)

  /**
   * Cargar todas las recompensas
   */
  const loadRewards = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const rewards = await rewardService.getAll()
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

  /**
   * Cargar categorías
   */
  const loadCategories = useCallback(async () => {
    try {
      const categories = await rewardService.getCategories()
      setState(prev => ({ ...prev, categories }))
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }, [])

  /**
   * Cargar datos al montar
   */
  useEffect(() => {
    loadRewards()
    loadCategories()
  }, [loadRewards, loadCategories])

  /**
   * Manejar cambios en el formulario
   */
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
    validarCampo(name, newValue)
  }, [validarCampo])

  /**
   * Abrir modal para crear
   */
  const openCreateModal = useCallback(() => {
    setFormData(initialRewardForm)
    limpiarErrores()
    setIsEditing(false)
    setIsModalOpen(true)
  }, [limpiarErrores])

  /**
   * Abrir modal para editar
   */
  const openEditModal = useCallback((reward) => {
    setFormData({
      name: reward.name || '',
      description: reward.description || '',
      points_cost: reward.pointsCost?.toString() || '',
      category: reward.category || '',
      image_url: reward.imageUrl || '',
      stock: reward.stock?.toString() || '',
      is_popular: reward.isPopular || false
    })
    limpiarErrores()
    setState(prev => ({ ...prev, selectedReward: reward }))
    setIsEditing(true)
    setIsModalOpen(true)
  }, [limpiarErrores])

  /**
   * Cerrar modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setFormData(initialRewardForm)
    setState(prev => ({ ...prev, selectedReward: null }))
  }, [])

  /**
   * Mostrar notificación
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  /**
   * Guardar recompensa (crear o actualizar)
   */
  const saveReward = useCallback(async (e) => {
    e.preventDefault()

    // Validar formulario completo
    if (!validarFormulario(formData)) {
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      const rewardData = {
        name: formData.name,
        description: formData.description,
        points_cost: parseInt(formData.points_cost),
        category: formData.category,
        image_url: formData.image_url,
        stock: parseInt(formData.stock) || 100,
        is_popular: formData.is_popular
      }

      if (isEditing && state.selectedReward) {
        await rewardService.update(state.selectedReward.id, rewardData)
        showNotification(adminMessages.REWARD_UPDATED)
      } else {
        await rewardService.create(rewardData)
        showNotification(adminMessages.REWARD_CREATED)
      }

      closeModal()
      loadRewards()
    } catch (error) {
      showNotification(error.message || adminMessages.REWARD_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [formData, isEditing, state.selectedReward, closeModal, loadRewards, showNotification])

  /**
   * Eliminar recompensa
   */
  const deleteReward = useCallback(async (id) => {
    if (!window.confirm(adminMessages.CONFIRM_DELETE)) {
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      await rewardService.update(id, { is_available: false })
      showNotification(adminMessages.REWARD_DELETED)
      loadRewards()
    } catch (error) {
      showNotification(error.message || adminMessages.REWARD_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [loadRewards, showNotification])

  return {
    // Estado
    ...state,
    formData,
    isModalOpen,
    isEditing,
    notification,
    fieldErrors,
    tieneErrores,

    // Acciones
    loadRewards,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    saveReward,
    deleteReward
  }
}
