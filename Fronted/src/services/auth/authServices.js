/**
 * Auth Service
 * Maneja todas las llamadas al API relacionadas con autenticación
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const authService = {
  /**
   * Inicia sesión con email y password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - { token, user }
   */
  
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error en el inicio de sesión')
    }

    return response.json()
  },

  /**
   * Cierra la sesión del usuario
   */
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  /**
   * Obtiene el token almacenado
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('token')
  },

  /**
   * Obtiene el usuario almacenado
   * @returns {Object|null}
   */
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}