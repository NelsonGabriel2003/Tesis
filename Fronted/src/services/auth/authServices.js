/**
 * Auth Service
 * Maneja todas las llamadas al API relacionadas con autenticación
 */
import api from '../api.js'

export const authService = {
  /**
   * Inicia sesión con email y password
   */
  login: async (credentials) => {
    return api.post('/auth/login', credentials)
  },

  /**
   * Registra un nuevo usuario
   */
  register: async (userData) => {
    return api.post('/auth/register', userData)
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
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  /**
   * Obtiene el token almacenado
   */
  getToken: () => {
    return localStorage.getItem('token')
  },

  /**
   * Obtiene el usuario almacenado
   */
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Verificar métodos de recuperación disponibles
   */
  verificarMetodosRecuperacion: async (email) => {
    return api.post('/auth/check-recovery-methods', { email })
  },

  /**
   * Solicitar código de recuperación
   */
  solicitarCodigoRecuperacion: async (email, metodo) => {
    return api.post('/auth/forgot-password', { email, metodo })
  },

  /**
   * Verificar código de recuperación
   */
  verificarCodigo: async (email, codigo) => {
    return api.post('/auth/verify-code', { email, codigo })
  },

  /**
   * Cambiar contraseña con código
   */
  cambiarPassword: async (email, codigo, nuevaPassword) => {
    return api.post('/auth/reset-password', { email, codigo, nuevaPassword })
  }
}