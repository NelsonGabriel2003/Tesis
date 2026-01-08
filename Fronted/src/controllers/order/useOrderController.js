import { useState, useEffect, useCallback } from 'react'
import { orderServices } from '../../services/order/orderServices'
import { calculateCartTotals } from '../../models/order/orderModel'

const INITIAL_CART = { items: [], tableNumber: '', notes: '' }

export const useOrderController = () => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : INITIAL_CART
  })
  
  const [orders, setOrders] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = useCallback((product, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.items.findIndex(item => item.productId === product.id)
      
      if (existingIndex >= 0) {
        const updatedItems = [...prev.items]
        updatedItems[existingIndex].quantity += quantity
        return { ...prev, items: updatedItems }
      }
      
      return {
        ...prev,
        items: [...prev.items, {
          productId: product.id,
          name: product.name,
          price: parseFloat(product.price),
          pointsEarned: product.points_earned,
          image: product.image_url,
          quantity
        }]
      }
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.productId === productId ? { ...item, quantity: Math.min(quantity, 10) } : item
      )
    }))
  }, [removeFromCart])

  const setTableNumber = useCallback((tableNumber) => {
    setCart(prev => ({ ...prev, tableNumber }))
  }, [])

  const setNotes = useCallback((notes) => {
    setCart(prev => ({ ...prev, notes }))
  }, [])

  const clearCart = useCallback(() => {
    setCart(INITIAL_CART)
    localStorage.removeItem('cart')
  }, [])

  const submitOrder = useCallback(async () => {
    if (cart.items.length === 0) {
      setError('El carrito está vacío')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        tableNumber: cart.tableNumber,
        notes: cart.notes
      }

      const response = await orderServices.create(orderData)
      
      if (response.success) {
        clearCart()
        setCurrentOrder(response.data.order)
        return response.data.order
      }
      throw new Error(response.message)
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [cart, clearCart])

  const fetchActiveOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await orderServices.getActiveOrders()
      if (response.success) setActiveOrders(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchOrderById = useCallback(async (orderId) => {
    setIsLoading(true)
    try {
      const response = await orderServices.getById(orderId)
      if (response.success) {
        setCurrentOrder(response.data)
        return response.data
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
    return null
  }, [])

  const cartTotals = calculateCartTotals(cart.items)

  return {
    cart, cartTotals, orders, activeOrders, currentOrder, isLoading, error,
    addToCart, removeFromCart, updateQuantity, setTableNumber, setNotes,
    clearCart, submitOrder, fetchActiveOrders, fetchOrderById, setCurrentOrder, setError
  }
}

export default useOrderController