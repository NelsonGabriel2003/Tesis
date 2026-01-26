/**
 * Password Reset Services
 * Llamadas a la API para recuperación de contraseña
 */

import api from '../api.js'

export const passwordResetService = {
  /**
   * Solicitar código de recuperación
   */
  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email })
  },

  /**
   * Verificar código
   */
  verifyCode: async (email, code) => {
    return api.post('/auth/verify-reset-code', { email, code })
  },

  /**
   * Cambiar contraseña
   */
  resetPassword: async (email, code, newPassword) => {
    return api.post('/auth/reset-password', { email, code, newPassword })
  },

  /**
   * Reenviar código
   */
  resendCode: async (email) => {
    return api.post('/auth/resend-code', { email })
  }
}
