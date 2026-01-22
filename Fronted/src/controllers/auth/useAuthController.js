/**
 * Auth Controller (Custom Hook)
 * Maneja toda la lógica de negocio para autenticación
 */



import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialAuthState, initialStatusState } from '../../models/auth/authModel'
import { authService } from '../../services/auth/authServices'

export const useAuthController = () => {
  const [formData, setFormData] = useState(initialAuthState)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState(initialStatusState)
  const navigate = useNavigate()

  /**
   * Maneja cambios en los inputs del formulario
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }, [])

  /**
   * Alterna visibilidad del password
   */
  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = useCallback(() => {
    setFormData(initialAuthState)
    setStatus(initialStatusState)
    setShowPassword(false)
  }, [])

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    setStatus({
      loading: true,
      error: null,
      success: false
    })

    try {
      const response = await authService.login(formData)

      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      setStatus({
        loading: false,
        error: null,
        success: true
      })

      // Redirigir según el rol del usuario
      if (response.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/main')
      }

      return response

    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || 'Error en el inicio de sesión',
        success: false
      })

      return null
    }
  }, [formData, navigate])

  return {

    formData,
    showPassword,
    status,
    
    handleInputChange,
    togglePassword,
    handleSubmit,
    resetForm
  }
}