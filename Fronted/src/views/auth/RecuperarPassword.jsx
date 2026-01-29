/**
 * RecuperarPassword - Flujo de recuperación de contraseña
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { Alert, Button, Input, PasswordInput, CodigoInput } from '../../components/ui'
import { authService } from '../../services/auth/authServices'

// Pasos del flujo
const PASOS = {
  EMAIL: 'email',
  METODO: 'metodo',
  CODIGO: 'codigo',
  PASSWORD: 'password',
  EXITO: 'exito'
}

const RecuperarPassword = () => {
  const navigate = useNavigate()

  const [pasoActual, setPasoActual] = useState(PASOS.EMAIL)
  const [email, setEmail] = useState('')
  const [metodo, setMetodo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [metodosDisponibles, setMetodosDisponibles] = useState({ tieneTelegram: false, tieneEmail: true })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  // Paso 1: Verificar email y métodos disponibles
  const verificarEmail = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const respuesta = await authService.verificarMetodosRecuperacion(email)
      setMetodosDisponibles(respuesta.data)
      setPasoActual(PASOS.METODO)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  // Paso 2: Enviar código por el método seleccionado
  const enviarCodigo = async () => {
    setError('')
    setCargando(true)

    try {
      await authService.solicitarCodigoRecuperacion(email, metodo)
      setPasoActual(PASOS.CODIGO)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  // Paso 3: Verificar código
  const verificarCodigo = async () => {
    setError('')
    setCargando(true)

    try {
      await authService.verificarCodigo(email, codigo)
      setPasoActual(PASOS.PASSWORD)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  // Paso 4: Cambiar contraseña
  const cambiarPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setCargando(true)

    try {
      await authService.cambiarPassword(email, codigo, nuevaPassword)
      setPasoActual(PASOS.EXITO)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  // Volver al paso anterior
  const volverPaso = () => {
    setError('')
    switch (pasoActual) {
      case PASOS.METODO:
        setPasoActual(PASOS.EMAIL)
        break
      case PASOS.CODIGO:
        setPasoActual(PASOS.METODO)
        break
      case PASOS.PASSWORD:
        setPasoActual(PASOS.CODIGO)
        break
      default:
        navigate('/login')
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-[460px] place-content-center gap-4 p-6 md:p-12">
      {/* Botón volver */}
      {pasoActual !== PASOS.EXITO && (
        <button
          onClick={volverPaso}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
      )}

      {/* Error */}
      {error && <Alert type="error" message={error} />}

      {/* Paso 1: Email */}
      {pasoActual === PASOS.EMAIL && (
        <form onSubmit={verificarEmail} className="space-y-4">
          <h2 className="text-2xl font-bold text-text-primary">Recuperar contraseña</h2>
          <p className="text-text-secondary">
            Ingresa tu email para recibir un código de verificación
          </p>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          <Button type="submit" cargando={cargando} fullWidth>
            Continuar
          </Button>
        </form>
      )}

      {/* Paso 2: Seleccionar método */}
      {pasoActual === PASOS.METODO && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-text-primary">Elige cómo recibir el código</h2>
          <p className="text-text-secondary">
            Selecciona el método para recibir tu código de verificación
          </p>

          <div className="space-y-3">
            {metodosDisponibles.tieneTelegram && (
              <button
                onClick={() => { setMetodo('telegram'); enviarCodigo() }}
                disabled={cargando}
                className="flex w-full items-center gap-4 rounded-xl border-2 border-input-border p-4 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <Send size={24} className="text-primary" />
                <div className="text-left">
                  <p className="font-medium text-text-primary">Telegram</p>
                  <p className="text-sm text-text-secondary">Recibir código por Telegram</p>
                </div>
              </button>
            )}

            <button
              onClick={() => { setMetodo('email'); enviarCodigo() }}
              disabled={cargando}
              className="flex w-full items-center gap-4 rounded-xl border-2 border-input-border p-4 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <Mail size={24} className="text-primary" />
              <div className="text-left">
                <p className="font-medium text-text-primary">Correo electrónico</p>
                <p className="text-sm text-text-secondary">Recibir código por email</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Ingresar código */}
      {pasoActual === PASOS.CODIGO && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-text-primary">Ingresa el código</h2>
          <p className="text-text-secondary">
            Enviamos un código de 6 caracteres a tu {metodo === 'telegram' ? 'Telegram' : 'correo'}
          </p>

          <CodigoInput
            longitud={6}
            valor={codigo}
            onChange={setCodigo}
            error={!!error}
          />

          <Button
            onClick={verificarCodigo}
            cargando={cargando}
            disabled={codigo.length < 6}
            fullWidth
          >
            Verificar código
          </Button>

          <button
            onClick={() => enviarCodigo()}
            className="w-full text-center text-sm text-primary hover:underline"
          >
            Reenviar código
          </button>
        </div>
      )}

      {/* Paso 4: Nueva contraseña */}
      {pasoActual === PASOS.PASSWORD && (
        <form onSubmit={cambiarPassword} className="space-y-4">
          <h2 className="text-2xl font-bold text-text-primary">Nueva contraseña</h2>
          <p className="text-text-secondary">
            Ingresa tu nueva contraseña
          </p>

          <PasswordInput
            label="Nueva contraseña"
            name="nuevaPassword"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            required
          />

          <PasswordInput
            label="Confirmar contraseña"
            name="confirmarPassword"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            required
          />

          <Button type="submit" cargando={cargando} fullWidth>
            Cambiar contraseña
          </Button>
        </form>
      )}

      {/* Paso 5: Éxito */}
      {pasoActual === PASOS.EXITO && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-alert-success-bg text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Contraseña actualizada</h2>
          <p className="text-text-secondary">
            Tu contraseña ha sido cambiada correctamente
          </p>

          <Button onClick={() => navigate('/login')} fullWidth>
            Ir al login
          </Button>
        </div>
      )}
    </div>
  )
}

export default RecuperarPassword
