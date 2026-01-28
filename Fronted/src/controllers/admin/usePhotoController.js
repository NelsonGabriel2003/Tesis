/**
 * usePhotoController
 * Controlador para gestion de fotos/eventos en el panel admin
 */

import { useState, useCallback, useEffect } from 'react'
import { photoService } from '../../services/admin/adminServices'
import { initialPhotoState, initialPhotoForm, adminMessages } from '../../models/admin/adminModel'

export const usePhotoController = () => {
  const [state, setState] = useState(initialPhotoState)
  const [formData, setFormData] = useState(initialPhotoForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [notification, setNotification] = useState(null)

  /**
   * Cargar todas las fotos (admin)
   */
  const loadPhotos = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const photos = await photoService.getAllAdmin()
      setState(prev => ({
        ...prev,
        photos,
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
   * Cargar datos al montar
   */
  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

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
    setFormData(initialPhotoForm)
    setIsEditing(false)
    setIsModalOpen(true)
  }, [])

  /**
   * Abrir modal para editar
   */
  const openEditModal = useCallback((photo) => {
    setFormData({
      title: photo.title || '',
      description: photo.description || '',
      image_url: photo.imageUrl || '',
      cloudinary_public_id: photo.cloudinaryPublicId || ''
    })
    setState(prev => ({ ...prev, selectedPhoto: photo }))
    setIsEditing(true)
    setIsModalOpen(true)
  }, [])

  /**
   * Cerrar modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setFormData(initialPhotoForm)
    setState(prev => ({ ...prev, selectedPhoto: null }))
  }, [])

  /**
   * Mostrar notificacion
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  /**
   * Guardar foto (crear o actualizar)
   */
  const savePhoto = useCallback(async (e) => {
    e.preventDefault()

    // Validar campos requeridos
    if (!formData.title || !formData.image_url) {
      showNotification(adminMessages.REQUIRED_FIELDS, 'error')
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      const photoData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        cloudinary_public_id: formData.cloudinary_public_id
      }

      if (isEditing && state.selectedPhoto) {
        await photoService.update(state.selectedPhoto.id, photoData)
        showNotification(adminMessages.PHOTO_UPDATED)
      } else {
        await photoService.create(photoData)
        showNotification(adminMessages.PHOTO_CREATED)
      }

      closeModal()
      loadPhotos()
    } catch (error) {
      showNotification(error.message || adminMessages.PHOTO_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [formData, isEditing, state.selectedPhoto, closeModal, loadPhotos, showNotification])

  /**
   * Eliminar foto
   */
  const deletePhoto = useCallback(async (id) => {
    if (!window.confirm(adminMessages.CONFIRM_DELETE)) {
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      await photoService.delete(id)
      showNotification(adminMessages.PHOTO_DELETED)
      loadPhotos()
    } catch (error) {
      showNotification(error.message || adminMessages.PHOTO_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [loadPhotos, showNotification])

  /**
   * Cambiar estado activo/inactivo
   */
  const toggleActive = useCallback(async (photo) => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      await photoService.update(photo.id, { is_active: !photo.isActive })
      showNotification(adminMessages.PHOTO_UPDATED)
      loadPhotos()
    } catch (error) {
      showNotification(error.message || adminMessages.PHOTO_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [loadPhotos, showNotification])

  return {
    // Estado
    ...state,
    formData,
    isModalOpen,
    isEditing,
    notification,

    // Acciones
    loadPhotos,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    savePhoto,
    deletePhoto,
    toggleActive
  }
}
