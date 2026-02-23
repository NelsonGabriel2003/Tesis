/**
 * LoginForm Component (View)
 * Componente de presentación para el formulario de login
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, PasswordInput, Logo } from '../../components/ui'

const frases = [
  'Acumula puntos en cada visita',
  'Canjea recompensas exclusivas',
  'Vive las mejores noches',
  'Tu fidelidad tiene premio'
]

const LoginForm = ({
  formData,
  showPassword,
  status,
  fieldErrors = {},
  limiteCampos = {},
  onInputChange,
  onTogglePassword,
  onSubmit
}) => {
  const navigate = useNavigate()
  const [indiceFrase, setIndiceFrase] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setIndiceFrase((prev) => (prev + 1) % frases.length)
        setFadeIn(true)
      }, 500)
    }, 4000)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto grid w-full max-w-[460px] place-content-center gap-4 p-6 md:p-12"
    >
      <Logo variant="icon" imgSize="h-56 w-56" className="mx-auto -mb-6" />

      <p className="hidden pb-4 text-text-secondary md:block">
        El lugar para la mejor fiesta esta aqui
      </p>
      <p className={`pb-4 text-text-secondary text-center transition-opacity duration-500 md:hidden ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        {frases[indiceFrase]}
      </p>

      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="tu@email.com"
        value={formData.email}
        onChange={onInputChange}
        maxLength={limiteCampos.correo}
        error={fieldErrors.email}
        required
      />

      <PasswordInput
        label="Contraseña"
        name="password"
        value={formData.password}
        onChange={onInputChange}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
        maxLength={limiteCampos.contrasena}
        error={fieldErrors.password}
        required
      />

      <div className="text-right">
        <button
          type="button"
          onClick={() => navigate('/recuperar-password')}
          className="text-sm text-primary hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {fieldErrors.general && (
        <p className="text-center text-sm text-red-500">{fieldErrors.general}</p>
      )}

      <Button type="submit" cargando={status.loading} className="w-full">
        Iniciar sesión
      </Button>

      <p className="text-center text-text-secondary">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-primary hover:underline font-medium"
        >
          Regístrate
        </button>
      </p>
    </form>
  )
}

export default LoginForm