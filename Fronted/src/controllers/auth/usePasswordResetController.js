/**
 * Password Reset Controller (Custom Hook)
 * Maneja toda la lógica de recuperación de contraseña
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordResetService } from '../../services/auth/passwordResetServices'

// Estados del flujo
const STEPS = {
  EMAIL: 'email',
  CODE: 'code',
  PASSWORD: 'password',
  SUCCESS: 'success'
}

export const usePasswordResetController = () => {
  const navigate = useNavigate()

  // Estado del paso actual
  const [step, setStep] = useState(STEPS.EMAIL)

  // Datos del formulario
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Estado de la UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [maskedEmail, setMaskedEmail] = useState('')

  // Countdown para reenviar código
  const [countdown, setCountdown] = useState(0)
  const countdownRef = useRef(null)

  // Refs para inputs del código
  const codeInputRefs = useRef([])

  /**
   * Iniciar countdown
   */
  const startCountdown = useCallback((seconds = 60) => {
    setCountdown(seconds)
    if (countdownRef.current) clearInterval(countdownRef.current)

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // Limpiar interval al desmontar
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  /**
   * Paso 1: Solicitar código
   */
  const handleRequestCode = useCallback(async (e) => {
    e?.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await passwordResetService.forgotPassword(email)

      if (response.success) {
        setMaskedEmail(response.maskedEmail || email)
        setStep(STEPS.CODE)
        startCountdown(60)
      }
    } catch (err) {
      setError(err.message || 'Error al enviar el código')
    } finally {
      setLoading(false)
    }
  }, [email, startCountdown])

  /**
   * Manejar cambio en inputs del código
   */
  const handleCodeChange = useCallback((index, value) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus al siguiente input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
  }, [code])

  /**
   * Manejar tecla en inputs del código
   */
  const handleCodeKeyDown = useCallback((index, e) => {
    // Backspace: volver al anterior
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }, [code])

  /**
   * Manejar pegado de código
   */
  const handleCodePaste = useCallback((e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)

    if (pastedData.length === 6) {
      setCode(pastedData.split(''))
      codeInputRefs.current[5]?.focus()
    }
  }, [])

  /**
   * Paso 2: Verificar código
   */
  const handleVerifyCode = useCallback(async (e) => {
    e?.preventDefault()
    setError(null)

    const codeString = code.join('')
    if (codeString.length !== 6) {
      setError('Ingresa el código completo')
      return
    }

    setLoading(true)

    try {
      const response = await passwordResetService.verifyCode(email, codeString)

      if (response.success) {
        setStep(STEPS.PASSWORD)
      }
    } catch (err) {
      setError(err.message || 'Código inválido o expirado')
      // Limpiar código en caso de error
      setCode(['', '', '', '', '', ''])
      codeInputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }, [code, email])

  /**
   * Reenviar código
   */
  const handleResendCode = useCallback(async () => {
    if (countdown > 0) return

    setError(null)
    setLoading(true)

    try {
      await passwordResetService.resendCode(email)
      startCountdown(60)
      setCode(['', '', '', '', '', ''])
      codeInputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.message || 'Error al reenviar el código')
    } finally {
      setLoading(false)
    }
  }, [email, countdown, startCountdown])

  /**
   * Paso 3: Cambiar contraseña
   */
  const handleResetPassword = useCallback(async (e) => {
    e?.preventDefault()
    setError(null)

    // Validaciones
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const codeString = code.join('')
      const response = await passwordResetService.resetPassword(email, codeString, newPassword)

      if (response.success) {
        setStep(STEPS.SUCCESS)
      }
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }, [email, code, newPassword, confirmPassword])

  /**
   * Volver al paso anterior
   */
  const handleBack = useCallback(() => {
    setError(null)

    if (step === STEPS.CODE) {
      setStep(STEPS.EMAIL)
      setCode(['', '', '', '', '', ''])
    } else if (step === STEPS.PASSWORD) {
      setStep(STEPS.CODE)
    }
  }, [step])

  /**
   * Ir al login
   */
  const handleGoToLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  return {
    // Estados
    step,
    STEPS,
    email,
    code,
    newPassword,
    confirmPassword,
    showPassword,
    loading,
    error,
    maskedEmail,
    countdown,
    codeInputRefs,

    // Setters
    setEmail,
    setNewPassword,
    setConfirmPassword,
    setShowPassword,

    // Handlers
    handleRequestCode,
    handleCodeChange,
    handleCodeKeyDown,
    handleCodePaste,
    handleVerifyCode,
    handleResendCode,
    handleResetPassword,
    handleBack,
    handleGoToLogin
  }
}
