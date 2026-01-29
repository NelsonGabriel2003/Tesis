/**
 * LoginForm Component (View)
 * Componente de presentación para el formulario de login
 */

import { useNavigate } from 'react-router-dom'
import { Alert, Button, Input, PasswordInput } from '../../components/ui'

const LoginForm = ({
  formData,
  showPassword,
  status,
  onInputChange,
  onTogglePassword,
  onSubmit
}) => {
  const navigate = useNavigate()

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto grid w-full max-w-[460px] place-content-center gap-4 p-6 md:p-12"
    >
      {/* Mensajes de estado */}
      {status.success && <Alert type="success" message="Inicio de sesión exitoso!" />}
      {status.error && <Alert type="error" message={status.error} />}

      {/* Logo */}
      <div className="flex items-center gap-[18px]">
        <img src="/images/Logo.svg" alt="logo" />
        <h2 className="text-xl font-bold text-text-primary">Logo</h2>
      </div>

      {/* Header */}
      <h2 className="text-3xl font-bold text-text-primary">Bienvenido!👋</h2>
      <p className="pb-4 pt-1 text-text-secondary">
        El lugar para la mejor fiesta esta aqui
      </p>

      {/* Email */}
      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={onInputChange}
        required
      />

      {/* Password */}
      <PasswordInput
        label="Password"
        name="password"
        value={formData.password}
        onChange={onInputChange}
        onTogglePassword={onTogglePassword}
        required
      />

      {/* Olvidé contraseña */}
      <div className="text-right">
        <button
          type="button"
          onClick={() => navigate('/recuperar-password')}
          className="text-sm text-primary hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Submit */}
      <Button type="submit" cargando={status.loading} className="w-full">
        Login
      </Button>

      {/* Registro */}
      <p className="text-center text-text-secondary">
        No tienes cuenta?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-primary hover:underline font-medium"
        >
          Registrate
        </button>
      </p>
    </form>
  )
}

export default LoginForm