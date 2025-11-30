/**
 * Menu Controller
 * Custom hook para manejar la lógica del módulo menú
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialMenuState, menuCategories } from '../../models/menu/menuModel'
import { menuService } from '../../services/menu/menuServices'

export const useMenuController = () => {
  const [menuState, setMenuState] = useState(initialMenuState)
  const [categories] = useState(menuCategories)
  const [orderItems, setOrderItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // Cargar items del menú
  const loadMenuItems = useCallback(async () => {
    setMenuState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const items = await menuService.getMenuItems()
      setMenuState(prev => ({
        ...prev,
        items,
        loading: false
      }))
    } catch (error) {
      setMenuState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [])

  // Filtrar por categoría
  const filterByCategory = useCallback(async (categoryId) => {
    setMenuState(prev => ({ ...prev, loading: true, selectedCategory: categoryId }))

    try {
      const items = await menuService.getMenuItemsByCategory(categoryId)
      setMenuState(prev => ({
        ...prev,
        items,
        loading: false
      }))
    } catch (error) {
      setMenuState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [])

  // Buscar items
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)

    if (!query.trim()) {
      loadMenuItems()
      return
    }

    setMenuState(prev => ({ ...prev, loading: true }))

    try {
      const items = await menuService.searchMenuItems(query)
      setMenuState(prev => ({
        ...prev,
        items,
        loading: false
      }))
    } catch (error) {
      setMenuState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [loadMenuItems])

  // Agregar item al pedido
  const addToOrder = useCallback((item) => {
    setOrderItems(prev => {
      const existingItem = prev.find(i => i.id === item.id)

      if (existingItem) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }

      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  // Remover item del pedido
  const removeFromOrder = useCallback((itemId) => {
    setOrderItems(prev => {
      const existingItem = prev.find(i => i.id === itemId)

      if (existingItem && existingItem.quantity > 1) {
        return prev.map(i =>
          i.id === itemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
      }

      return prev.filter(i => i.id !== itemId)
    })
  }, [])

  // Limpiar pedido
  const clearOrder = useCallback(() => {
    setOrderItems([])
  }, [])

  // Obtener cantidad de un item en el pedido
  const getItemQuantity = useCallback((itemId) => {
    const item = orderItems.find(i => i.id === itemId)
    return item ? item.quantity : 0
  }, [orderItems])

  // Calcular totales
  const orderTotal = menuService.calculateOrderTotal(orderItems)
  const orderPoints = menuService.calculateOrderPoints(orderItems)

  // Volver al main
  const goBack = useCallback(() => {
    navigate('/main')
  }, [navigate])

  // Cargar menú al montar
  useEffect(() => {
    loadMenuItems()
  }, [loadMenuItems])

  return {
    // Estado
    menuItems: menuState.items,
    loading: menuState.loading,
    error: menuState.error,
    selectedCategory: menuState.selectedCategory,
    categories,
    orderItems,
    searchQuery,
    orderTotal,
    orderPoints,

    // Acciones
    filterByCategory,
    handleSearch,
    addToOrder,
    removeFromOrder,
    clearOrder,
    getItemQuantity,
    goBack,
    loadMenuItems
  }
}
