import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  initialRegisterState,
  initialStatusState,
  mensajesRegistro,
  validaciones,
  limiteCampos
} from '../../models/auth/authModel'
import { authService } from '../../services/auth/authServices'
import { useAuth } from '../../hooks/useAuth'

export const useRegisterController = () => {
  const [formData, setFormData] = useState(initialRegisterState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [status, setStatus] = useState(initialStatusState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const navigate = useNavigate()
  const { iniciarSesion } = useAuth()

  const toggleTerminos = useCallback(() => {
    setAceptaTerminos((prev) => !prev)
    setFieldErrors((prev) => ({ ...prev, terminos: null }))
  }, [])

  const validarCampo = useCallback((name, value, datosActuales) => {
    switch (name) {
      case 'name':
        if (value.length > 0 && !validaciones.nombre.test(value))
          return mensajesRegistro.NOMBRE_INVALIDO
        if (value.trim().length > 0 && value.trim().length < validaciones.nombreMinimo)
          return mensajesRegistro.NOMBRE_CORTO
        if (value.trim().length >= validaciones.nombreMinimo && value.trim().split(/\s+/).length < 2)
          return mensajesRegistro.NOMBRE_INCOMPLETO
        return null

      case 'email':
        if (value.length > 0 && !value.includes('@'))
          return 'El correo debe contener @'
        if (value.includes('@') && !validaciones.correo.test(value))
          return mensajesRegistro.CORREO_INVALIDO
        return null

      case 'phone':
        if (value.length > 0 && !/^[0-9]*$/.test(value))
          return 'Solo se permiten números'
        if (value.length >= 1 && value[0] !== '0')
          return 'Debe comenzar con 09'
        if (value.length >= 2 && value[1] !== '9')
          return 'Debe comenzar con 09'
        if (value.length > 0 && value.length < 10)
          return 'El teléfono debe tener 10 dígitos'
        return null

      case 'password':
        if (value.length > 0 && !validaciones.sinEspacios.test(value))
          return mensajesRegistro.CONTRASENA_ESPACIOS
        if (value.length > 0 && value.length < validaciones.largoMinimoContrasena)
          return mensajesRegistro.CONTRASENA_CORTA
        if (value.length >= validaciones.largoMinimoContrasena && !validaciones.fuerzaContrasena.test(value))
          return mensajesRegistro.CONTRASENA_DEBIL
        return null

      case 'confirmPassword':
        if (value.length > 0 && datosActuales.password !== value)
          return mensajesRegistro.CONTRASENA_NO_COINCIDE
        return null

      default:
        return null
    }
  }, [])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const nuevosDatos = { ...prev, [name]: value }

      const error = validarCampo(name, value, nuevosDatos)
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error
      }))

      if (name === 'password' && nuevosDatos.confirmPassword.length > 0) {
        const errorConfirm = nuevosDatos.password !== nuevosDatos.confirmPassword
          ? mensajesRegistro.CONTRASENA_NO_COINCIDE
          : null
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          confirmPassword: errorConfirm
        }))
      }

      return nuevosDatos
    })
  }, [validarCampo])

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
  }, [])

  const resetForm = useCallback(() => {
    setFormData(initialRegisterState)
    setStatus(initialStatusState)
    setFieldErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [])

  const validarFormulario = useCallback(() => {
    const errores = {}

    if (!formData.name.trim()) {
      errores.name = 'El nombre es requerido'
    } else if (!validaciones.nombre.test(formData.name)) {
      errores.name = mensajesRegistro.NOMBRE_INVALIDO
    } else if (formData.name.trim().length < validaciones.nombreMinimo) {
      errores.name = mensajesRegistro.NOMBRE_CORTO
    } else if (formData.name.trim().split(/\s+/).length < 2) {
      errores.name = mensajesRegistro.NOMBRE_INCOMPLETO
    }

    if (!formData.email.trim()) {
      errores.email = 'El email es requerido'
    } else if (!validaciones.correo.test(formData.email)) {
      errores.email = mensajesRegistro.CORREO_INVALIDO
    }

    if (!formData.phone.trim()) {
      errores.phone = 'El teléfono es requerido'
    } else if (!validaciones.telefono.test(formData.phone)) {
      errores.phone = mensajesRegistro.TELEFONO_INVALIDO
    }

    if (!formData.password) {
      errores.password = 'La contraseña es requerida'
    } else if (!validaciones.sinEspacios.test(formData.password)) {
      errores.password = mensajesRegistro.CONTRASENA_ESPACIOS
    } else if (formData.password.length < validaciones.largoMinimoContrasena) {
      errores.password = mensajesRegistro.CONTRASENA_CORTA
    } else if (!validaciones.fuerzaContrasena.test(formData.password)) {
      errores.password = mensajesRegistro.CONTRASENA_DEBIL
    }

    if (!formData.confirmPassword) {
      errores.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      errores.confirmPassword = mensajesRegistro.CONTRASENA_NO_COINCIDE
    }

    if (!aceptaTerminos) {
      errores.terminos = mensajesRegistro.TERMINOS_REQUERIDOS
    }

    setFieldErrors(errores)
    return Object.keys(errores).length === 0
  }, [formData, aceptaTerminos])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return null
    }

    setStatus({ loading: true, error: null, success: false })

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        password: formData.password
      }

      const response = await authService.register(userData)
      await iniciarSesion(response.token, response.user)

      setStatus({ loading: false, error: null, success: true })
      navigate('/main')
      return response

    } catch (error) {
      const msg = error.message || ''
      let campo = error.field || null

      if (!campo && (msg.includes('email ya') || msg.includes('correo ya') || msg.includes('already'))) {
        campo = 'email'
      } else if (!campo && (msg.includes('telefono ya') || msg.includes('numero') || msg.includes('phone'))) {
        campo = 'phone'
      }

      if (campo) {
        setFieldErrors((prev) => ({
          ...prev,
          [campo]: campo === 'email' ? mensajesRegistro.CORREO_EXISTE : msg
        }))
        setStatus({ loading: false, error: null, success: false })
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          general: msg || mensajesRegistro.ERROR
        }))
        setStatus({ loading: false, error: null, success: false })
      }
      return null
    }
  }, [formData, validarFormulario, navigate, iniciarSesion])

  const goToLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  return {
    formData,
    showPassword,
    showConfirmPassword,
    status,
    fieldErrors,
    limiteCampos,
    aceptaTerminos,
    handleInputChange,
    togglePassword,
    toggleConfirmPassword,
    toggleTerminos,
    handleSubmit,
    resetForm,
    goToLogin
  }
}
