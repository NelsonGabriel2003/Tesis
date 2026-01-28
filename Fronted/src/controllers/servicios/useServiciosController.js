/**
 * Servicios Controller
 * Custom hook para manejar la lógica del módulo servicios
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialServiciosState, serviciosCategorias } from '../../models/servicios/serviciosModel'
import { serviciosService } from '../../services/servicios/serviciosServices'
import api from '../../services/api'

export const useServiciosController = () => {
  const [state, setState] = useState(initialServiciosState)
  const [categories] = useState(serviciosCategorias)
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedService, setSelectedService] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [reservationStatus, setReservationStatus] = useState(null)


  // Puntos del usuario (desde API)
  const [userPoints, setUserPoints] = useState(0)

  const navigate = useNavigate()

  // Cargar puntos del usuario
  const loadUserPoints = useCallback(async () => {
    try {
      const response = await api.get('/profile')
      setUserPoints(response.data?.currentPoints || response.data?.current_points || 0)
    } catch (error) {
      console.error('Error cargando puntos:', error)
    }
  }, [])


  // Cargar servicios
  const loadServicios = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const services = await serviciosService.getServicios()
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

  // Filtrar por categoría
  const filterByCategory = useCallback(async (categoryId) => {
    setSelectedCategory(categoryId)
    setState(prev => ({ ...prev, loading: true }))

    try {
      const services = await serviciosService.getServiciosByCategory(categoryId)
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

  // Seleccionar servicio para ver detalles
  const selectService = useCallback((service) => {
    setSelectedService(service)
    setShowModal(true)
  }, [])

  // Cerrar modal
  const closeModal = useCallback(() => {
    setShowModal(false)
    setSelectedService(null)
    setReservationStatus(null)
  }, [])

  // Reservar servicio
  const reserveService = useCallback(async (serviceId) => {
    setReservationStatus({ loading: true, error: null, success: false })

    try {
      const result = await serviciosService.reservarServicio(serviceId, {})
      setReservationStatus({
        loading: false,
        error: null,
        success: true,
        data: result
      })
    } catch (error) {
      setReservationStatus({
        loading: false,
        error: error.message,
        success: false
      })
    }
  }, [])

  // Verificar si puede usar el servicio
  const canUseService = useCallback((service) => {
    return serviciosService.canUseService(service, userPoints)
  }, [userPoints])

  // Volver al main
  const goBack = useCallback(() => {
    navigate('/main')
  }, [navigate])

  // Cargar servicios al montar
  useEffect(() => {
    loadServicios()
    loadUserPoints() 
  }, [loadServicios,loadUserPoints])

  return {
    // Estado
    services: state.services,
    loading: state.loading,
    error: state.error,
    categories,
    selectedCategory,
    selectedService,
    showModal,
    reservationStatus,
    userPoints,

    // Acciones
    filterByCategory,
    selectService,
    closeModal,
    reserveService,
    canUseService,
    goBack,
    loadServicios
  }
}
