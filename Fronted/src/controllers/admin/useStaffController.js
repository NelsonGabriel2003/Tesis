/**
 * useStaffController
 * Controlador para gestión del personal en el panel admin
 */

import { useState, useCallback, useEffect } from 'react'
import { staffService } from '../../services/admin/adminServices'
import { initialStaffState, initialStaffForm, adminMessages } from '../../models/admin/adminModel'

export const useStaffController = () => {
  const [state, setState] = useState(initialStaffState)
  const [formData, setFormData] = useState(initialStaffForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [notification, setNotification] = useState(null)

  // Estado para modal de código de vinculación
  const [linkCodeModal, setLinkCodeModal] = useState({
    isOpen: false,
    staffName: '',
    linkCode: '',
    expiresAt: ''
  })

  /**
   * Cargar todo el personal
   */
  const loadStaff = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const staff = await staffService.getAll()
      setState(prev => ({
        ...prev,
        staff,
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
    loadStaff()
  }, [loadStaff])

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
    setFormData(initialStaffForm)
    setIsEditing(false)
    setIsModalOpen(true)
  }, [])

  /**
   * Abrir modal para editar
   */
  const openEditModal = useCallback((staffMember) => {
    setFormData({
      name: staffMember.name || '',
      phone: staffMember.phone || '',
      email: staffMember.email || '',
      role: staffMember.role || 'waiter'
    })
    setState(prev => ({ ...prev, selectedStaff: staffMember }))
    setIsEditing(true)
    setIsModalOpen(true)
  }, [])

  /**
   * Cerrar modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setFormData(initialStaffForm)
    setState(prev => ({ ...prev, selectedStaff: null }))
  }, [])

  /**
   * Mostrar notificación
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  /**
   * Guardar staff (crear o actualizar)
   */
  const saveStaff = useCallback(async (e) => {
    e.preventDefault()

    // Validar campos requeridos
    if (!formData.name) {
      showNotification(adminMessages.REQUIRED_FIELDS, 'error')
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      const staffData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        role: formData.role
      }

      if (isEditing && state.selectedStaff) {
        await staffService.update(state.selectedStaff.id, staffData)
        showNotification(adminMessages.STAFF_UPDATED)
      } else {
        await staffService.create(staffData)
        showNotification(adminMessages.STAFF_CREATED)
      }

      closeModal()
      loadStaff()
    } catch (error) {
      showNotification(error.message || adminMessages.STAFF_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [formData, isEditing, state.selectedStaff, closeModal, loadStaff, showNotification])

  /**
   * Eliminar staff
   */
  const deleteStaff = useCallback(async (id, name) => {
    if (!window.confirm(`¿Eliminar a ${name}?`)) {
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      await staffService.delete(id)
      showNotification(adminMessages.STAFF_DELETED)
      loadStaff()
    } catch (error) {
      showNotification(error.message || adminMessages.STAFF_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [loadStaff, showNotification])

  /**
   * Generar código de vinculación
   */
  const generateLinkCode = useCallback(async (id, name) => {
    try {
      const response = await staffService.generateLinkCode(id)
      setLinkCodeModal({
        isOpen: true,
        staffName: name,
        linkCode: response.linkCode,
        expiresAt: response.expiresAt
      })
      showNotification(adminMessages.STAFF_CODE_GENERATED)
      loadStaff()
    } catch (error) {
      showNotification(error.message || adminMessages.STAFF_ERROR, 'error')
    }
  }, [loadStaff, showNotification])

  /**
   * Cerrar modal de código
   */
  const closeLinkCodeModal = useCallback(() => {
    setLinkCodeModal({
      isOpen: false,
      staffName: '',
      linkCode: '',
      expiresAt: ''
    })
  }, [])

  /**
   * Desvincular Telegram
   */
  const unlinkTelegram = useCallback(async (id, name) => {
    if (!window.confirm(`¿Desvincular Telegram de ${name}?`)) {
      return
    }

    try {
      await staffService.unlinkTelegram(id)
      showNotification(adminMessages.STAFF_UNLINKED)
      loadStaff()
    } catch (error) {
      showNotification(error.message || adminMessages.STAFF_ERROR, 'error')
    }
  }, [loadStaff, showNotification])

  /**
   * Filtrar staff por búsqueda
   */
  const filterStaff = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      return state.staff
    }
    return state.staff.filter(s =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [state.staff])

  return {
    // Estado
    ...state,
    formData,
    isModalOpen,
    isEditing,
    notification,
    linkCodeModal,

    // Acciones
    loadStaff,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    saveStaff,
    deleteStaff,
    generateLinkCode,
    closeLinkCodeModal,
    unlinkTelegram,
    filterStaff
  }
}
