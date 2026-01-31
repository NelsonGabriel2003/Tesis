/**
 * Register Controller (Custom Hook)
 * Maneja toda la lógica de negocio para registro de usuarios
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  initialRegisterState, 
  initialStatusState,
  registerMessages,
  validations 
} from '../../models/auth/authModel'
import { authService } from '../../services/auth/authServices'
import { useAuth } from '../../hooks/useAuth'

export const useRegisterController = () => {
  const [formData, setFormData] = useState(initialRegisterState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [status, setStatus] = useState(initialStatusState)
  const [fieldErrors, setFieldErrors] = useState({})
  const navigate = useNavigate()
  
  // Usar el AuthContext para actualizar el estado global
  const { iniciarSesion } = useAuth()

  /**
   * Maneja cambios en los inputs del formulario
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo al escribir
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: null
      }))
    }
  }, [fieldErrors])

  /**
   * Alterna visibilidad del password
   */
  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  /**
   * Alterna visibilidad del confirm password
   */
  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
  }, [])

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = useCallback(() => {
    setFormData(initialRegisterState)
    setStatus(initialStatusState)
    setFieldErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [])

  /**
   * Valida el formulario antes de enviar
   * @returns {boolean} - true si es válido
   */
  const validateForm = useCallback(() => {
    const errors = {}

    // Validar nombre
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido'
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido'
    } else if (!validations.email.test(formData.email)) {
      errors.email = registerMessages.INVALID_EMAIL
    }

    // Validar teléfono (opcional pero si tiene valor debe ser válido)
    if (formData.phone && !validations.phone.test(formData.phone)) {
      errors.phone = 'El teléfono debe tener 10 dígitos'
    }

    // Validar password
    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    } else if (formData.password.length < validations.minPasswordLength) {
      errors.password = registerMessages.PASSWORD_SHORT
    }

    // Validar confirmación de password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = registerMessages.PASSWORD_MISMATCH
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    // Validar formulario
    if (!validateForm()) {
      return null
    }

    setStatus({
      loading: true,
      error: null,
      success: false
    })

    try {
      // Preparar datos (sin confirmPassword)
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        password: formData.password
      }

      const response = await authService.register(userData)
      
      // Usar iniciarSesion del AuthContext
      // Esto actualiza el estado global inmediatamente
      await iniciarSesion(response.token, response.user)

      setStatus({
        loading: false,
        error: null,
        success: true
      })

      // Navegar inmediatamente - el estado ya está actualizado
      navigate('/main')

      return response

    } catch (error) {
      let errorMessage = registerMessages.ERROR

      // Manejar errores específicos del backend
      if (error.message?.includes('ya está registrado') || error.message?.includes('already exists')) {
        errorMessage = registerMessages.EMAIL_EXISTS
      } else if (error.message) {
        errorMessage = error.message
      }

      setStatus({
        loading: false,
        error: errorMessage,
        success: false
      })
      
      return null
    }
  }, [formData, validateForm, navigate, iniciarSesion])

  /**
   * Navegar al login
   */
  const goToLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  return {
    // Estado
    formData,
    showPassword,
    showConfirmPassword,
    status,
    fieldErrors,
    
    // Acciones
    handleInputChange,
    togglePassword,
    toggleConfirmPassword,
    handleSubmit,
    resetForm,
    goToLogin
  }
}