/**
 * Servicios Controller
 * Custom hook para manejar la lógica del módulo servicios
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialServiciosState, serviciosCategorias } from '../../models/servicios/serviciosModel'
import { serviciosService } from '../../services/servicios/serviciosServices'

export const useServiciosController = () => {
  const [state, setState] = useState(initialServiciosState)
  const [categories] = useState(serviciosCategorias)
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedService, setSelectedService] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const navigate = useNavigate()

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
  }, [])

  // Volver al main
  const goBack = useCallback(() => {
    navigate('/main')
  }, [navigate])

  // Cargar servicios al montar
  useEffect(() => {
    loadServicios()
  }, [loadServicios])

  return {
    // Estado
    services: state.services,
    loading: state.loading,
    error: state.error,
    categories,
    selectedCategory,
    selectedService,
    showModal,

    // Acciones
    filterByCategory,
    selectService,
    closeModal,
    goBack,
    loadServicios
  }
}