/**
 * RegisterForm Component (View)
 * Componente de presentación para el formulario de registro
 */

import { Alert, Button, Input, PasswordInput } from '../../components/ui'

const RegisterForm = ({
  formData,
  showPassword,
  showConfirmPassword,
  status,
  fieldErrors,
  onInputChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit,
  onGoToLogin
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto grid w-full max-w-[460px] place-content-center gap-4 p-6 md:p-12"
    >
      {/* Mensajes de estado */}
      {status.success && <Alert type="success" message="¡Registro exitoso! Redirigiendo..." />}
      {status.error && <Alert type="error" message={status.error} />}

      {/* Logo */}
      <div className="flex items-center gap-[18px]">
        <img src="/images/Logo.svg" alt="logo" />
        <h2 className="text-xl font-bold text-text-primary">Logo</h2>
      </div>

      {/* Header */}
      <h2 className="text-3xl font-bold text-text-primary">Crear Cuenta 🎉</h2>
      <p className="pb-2 text-text-secondary">
        Únete y comienza a acumular puntos
      </p>

      {/* Nombre */}
      <div>
        <Input
          label="Nombre completo"
          type="text"
          name="name"
          placeholder="Tu nombre"
          value={formData.name}
          onChange={onInputChange}
          required
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="tu@email.com"
          value={formData.email}
          onChange={onInputChange}
          required
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <Input
          label="Teléfono"
          type="tel"
          name="phone"
          placeholder="0999999999"
          value={formData.phone}
          onChange={onInputChange}
        />
        {fieldErrors.phone && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <PasswordInput
          label="Contraseña"
          name="password"
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChange={onInputChange}
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
          required
        />
        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
        )}
      </div>

      {/* Confirmar Password */}
      <div>
        <PasswordInput
          label="Confirmar contraseña"
          name="confirmPassword"
          placeholder="Repite tu contraseña"
          value={formData.confirmPassword}
          onChange={onInputChange}
          showPassword={showConfirmPassword}
          onTogglePassword={onToggleConfirmPassword}
          required
        />
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {/* Submit */}
      <Button 
        type="submit" 
        loading={status.loading} 
        disabled={status.loading}
        className="w-full"
      >
        {status.loading ? 'Registrando...' : 'Crear cuenta'}
      </Button>

      {/* Link a Login */}
      <p className="text-center text-text-secondary">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={onGoToLogin}
          className="text-primary hover:underline font-medium"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  )
}

export default RegisterForm
