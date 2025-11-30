/**
 * Menu Services
 * Servicios para el módulo de menú (mock sin base de datos)
 */

import { mockMenuItems, menuCategories } from '../../models/menu/menuModel'

// Simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const menuService = {
  /**
   * Obtener todos los items del menú
   */
  getMenuItems: async () => {
    await delay(500) // Simular latencia
    return mockMenuItems
  },

  /**
   * Obtener items por categoría
   */
  getMenuItemsByCategory: async (categoryId) => {
    await delay(300)
    if (categoryId === 'todos') {
      return mockMenuItems
    }
    return mockMenuItems.filter(item => item.category === categoryId)
  },

  /**
   * Obtener un item por ID
   */
  getMenuItemById: async (id) => {
    await delay(200)
    return mockMenuItems.find(item => item.id === id) || null
  },

  /**
   * Obtener categorías
   */
  getCategories: async () => {
    await delay(100)
    return menuCategories
  },

  /**
   * Buscar items en el menú
   */
  searchMenuItems: async (query) => {
    await delay(300)
    const lowerQuery = query.toLowerCase()
    return mockMenuItems.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
    )
  },

  /**
   * Calcular puntos de una orden
   */
  calculateOrderPoints: (items) => {
    return items.reduce((total, item) => total + (item.points * item.quantity), 0)
  },

  /**
   * Calcular total de una orden
   */
  calculateOrderTotal: (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
}
