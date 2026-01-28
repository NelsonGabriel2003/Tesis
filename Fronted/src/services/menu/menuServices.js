/**
 * Menu Services
 * Servicios para el módulo de menú - Conectado al Backend
 */

import api from '../api.js'

export const menuService = {
  /**
   * Obtener todos los items del menú
   */
  getMenuItems: async () => {
    const response = await api.get('/products')
    return response.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      points: product.pointsEarned || 0,
      category: product.category,
      imageUrl: product.imageUrl,
      available: product.isActive !== false
    }))
  },

  /**
   * Obtener items por categoría
   */
  getMenuItemsByCategory: async (categoryId) => {
    let endpoint = '/products'
    if (categoryId && categoryId !== 'todos') {
      endpoint += `?category=${categoryId}`
    }
    const response = await api.get(endpoint)
    return response.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      points: product.pointsEarned || 0,
      category: product.category,
      imageUrl: product.imageUrl,
      available: product.isActive !== false
    }))
  },

  /**
   * Obtener un item por ID
   */
  getMenuItemById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`)
      const product = response.data
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        points: product.pointsEarned || 0,
        category: product.category,
        imageUrl: product.imageUrl,
        available: product.isActive !== false
      }
    } catch {
      return null
    }
  },

  /**
   * Obtener categorías
   */
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories')
      return [
        { id: 'todos', name: 'Todos', icon: '🍽️' },
        ...response.data.map(cat => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: getIconForCategory(cat)
        }))
      ]
    } catch {
      // Devolver categorías por defecto si falla
      return [
        { id: 'todos', name: 'Todos', icon: '🍽️' },
        { id: 'bebidas', name: 'Bebidas', icon: '🍺' },
        { id: 'cocteles', name: 'Cócteles', icon: '🍹' },
        { id: 'snacks', name: 'Snacks', icon: '🍕' },
        { id: 'promociones', name: 'Promos', icon: '🔥' }
      ]
    }
  },

  /**
   * Buscar items en el menú
   */
  searchMenuItems: async (query) => {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`)
      return response.data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        points: product.pointsEarned || 0,
        category: product.category,
        imageUrl: product.imageUrl,
        available: product.isActive !== false
      }))
    } catch {
      // Si falla la búsqueda en servidor, filtrar localmente
      const items = await menuService.getMenuItems()
      const lowerQuery = query.toLowerCase()
      return items.filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
      )
    }
  },

  /**
   * Calcular puntos de una orden (lógica local)
   */
  calculateOrderPoints: (items) => {
    return items.reduce((total, item) => total + ((item.points || 0) * item.quantity), 0)
  },

  /**
   * Calcular total de una orden (lógica local)
   */
  calculateOrderTotal: (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
}
