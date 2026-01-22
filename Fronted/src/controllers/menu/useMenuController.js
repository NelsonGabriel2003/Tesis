/**
 * Menu Controller
 * Custom hook para manejar la lógica del módulo menú
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialMenuState, menuCategories } from '../../models/menu/menuModel'
import { menuService } from '../../services/menu/menuServices'

const CART_STORAGE_KEY = 'cart'

const getStoredCart = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : { items: [], tableNumber: '', notes: '' }
  } catch {
    return { items: [], tableNumber: '', notes: '' }
  }
}

const saveCart = (cart) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

export const useMenuController = () => {
  const [menuState, setMenuState] = useState(initialMenuState)
  const [categories] = useState(menuCategories)
  const [cart, setCart] = useState(getStoredCart)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    saveCart(cart)
  }, [cart])

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
    setCart(prev => {
      const existingIndex = prev.items.findIndex(i => i.productId === item.id)

      if (existingIndex >= 0) {
        const updatedItems = [...prev.items]
        updatedItems[existingIndex].quantity += 1
        return { ...prev, items: updatedItems }
      }

      return {
        ...prev,
        items: [...prev.items, {
          productId: item.id,
          name: item.name,
          price: parseFloat(item.price),
          pointsEarned: item.points || 0,
          image: item.imageUrl,
          quantity: 1
        }]
      }
    })
  }, [])

  // Remover item del pedido
  const removeFromOrder = useCallback((itemId) => {
    setCart(prev => {
      const existingItem = prev.items.find(i => i.productId === itemId)

      if (existingItem && existingItem.quantity > 1) {
        return {
          ...prev,
          items: prev.items.map(i =>
            i.productId === itemId ? { ...i, quantity: i.quantity - 1 } : i
          )
        }
      }

      return {
        ...prev,
        items: prev.items.filter(i => i.productId !== itemId)
      }
    })
  }, [])

  // Limpiar pedido
  const clearOrder = useCallback(() => {
    setCart({ items: [], tableNumber: '', notes: '' })
    localStorage.removeItem(CART_STORAGE_KEY)
  }, [])

  // Obtener cantidad de un item en el pedido
  const getItemQuantity = useCallback((itemId) => {
    const item = cart.items.find(i => i.productId === itemId)
    return item ? item.quantity : 0
  }, [cart.items])

  // Convertir items del carrito al formato esperado
  const orderItems = cart.items.map(item => ({
    id: item.productId,
    ...item
  }))

  // Calcular totales
  const orderTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const orderPoints = orderItems.reduce((sum, item) => sum + ((item.pointsEarned || 0) * item.quantity), 0)

  // Volver al main
  const goBack = useCallback(() => {
    navigate('/main')
  }, [navigate])

  // Cargar menú al montar
  useEffect(() => {
    loadMenuItems()
  }, [loadMenuItems])

  return {
    menuItems: menuState.items,
    loading: menuState.loading,
    error: menuState.error,
    selectedCategory: menuState.selectedCategory,
    categories,
    orderItems,
    searchQuery,
    orderTotal,
    orderPoints,

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