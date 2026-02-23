import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  initialAuthState,
  initialStatusState,
  validaciones,
  limiteCampos
} from '../../models/auth/authModel'
import { authService } from '../../services/auth/authServices'
import { useAuth } from '../../hooks/useAuth'

const MAX_INTENTOS = 5
const TIEMPO_BLOQUEO = 60000

export const useAuthController = () => {
  const [formData, setFormData] = useState(initialAuthState)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState(initialStatusState)
  const [fieldErrors, setFieldErrors] = useState({})
  const intentosFallidos = useRef(0)
  const bloqueadoHasta = useRef(null)
  const navigate = useNavigate()
  const { iniciarSesion } = useAuth()

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'email') {
      if (value.length > 0 && !value.includes('@')) {
        setFieldErrors((prev) => ({ ...prev, email: 'El correo debe contener @' }))
      } else if (value.includes('@') && !validaciones.correo.test(value)) {
        setFieldErrors((prev) => ({ ...prev, email: 'El formato del email no es válido' }))
      } else {
        setFieldErrors((prev) => ({ ...prev, email: null }))
      }
    }

    if (name === 'password' && fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: null }))
    }
  }, [fieldErrors])

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const resetForm = useCallback(() => {
    setFormData(initialAuthState)
    setStatus(initialStatusState)
    setFieldErrors({})
    setShowPassword(false)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    if (bloqueadoHasta.current && Date.now() < bloqueadoHasta.current) {
      const segundos = Math.ceil((bloqueadoHasta.current - Date.now()) / 1000)
      setFieldErrors((prev) => ({
        ...prev,
        general: `Demasiados intentos. Espera ${segundos} segundos.`
      }))
      return null
    }

    const errores = {}

    if (!formData.email.trim()) {
      errores.email = 'El email es requerido'
    } else if (!validaciones.correo.test(formData.email)) {
      errores.email = 'El formato del email no es válido'
    }

    if (!formData.password) {
      errores.password = 'La contraseña es requerida'
    }

    if (Object.keys(errores).length > 0) {
      setFieldErrors(errores)
      return null
    }

    setStatus({ loading: true, error: null, success: false })
    setFieldErrors({})

    try {
      const response = await authService.login(formData)
      await iniciarSesion(response.token, response.user)

      intentosFallidos.current = 0
      bloqueadoHasta.current = null

      setStatus({ loading: false, error: null, success: true })

      if (response.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/main')
      }

      return response

    } catch (error) {
      intentosFallidos.current += 1

      if (intentosFallidos.current >= MAX_INTENTOS) {
        bloqueadoHasta.current = Date.now() + TIEMPO_BLOQUEO
        setFieldErrors({
          general: `Demasiados intentos fallidos. Espera 60 segundos.`
        })
        setStatus({ loading: false, error: null, success: false })

        setTimeout(() => {
          intentosFallidos.current = 0
          bloqueadoHasta.current = null
          setFieldErrors((prev) => ({ ...prev, general: null }))
        }, TIEMPO_BLOQUEO)
      } else {
        const restantes = MAX_INTENTOS - intentosFallidos.current
        setFieldErrors({
          general: `Credenciales inválidas. ${restantes} intento${restantes === 1 ? '' : 's'} restante${restantes === 1 ? '' : 's'}.`
        })
        setStatus({ loading: false, error: null, success: false })
      }

      return null
    }
  }, [formData, navigate, iniciarSesion])

  return {
    formData,
    showPassword,
    status,
    fieldErrors,
    limiteCampos,
    handleInputChange,
    togglePassword,
    handleSubmit,
    resetForm
  }
}