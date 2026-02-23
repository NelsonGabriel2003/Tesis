/**
 * RegisterForm Component (View)
 * Componente de presentación para el formulario de registro
 */

import { useState } from 'react'
import { Button, Input, PasswordInput, Logo } from '../../components/ui'
import { TerminosModal } from '../legal'

const RegisterForm = ({
  formData,
  showPassword,
  showConfirmPassword,
  status,
  fieldErrors,
  limiteCampos = {},
  aceptaTerminos,
  onInputChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onToggleTerminos,
  onSubmit,
  onGoToLogin
}) => {
  const [mostrarTerminos, setMostrarTerminos] = useState(false)

  return (
    <>
    <TerminosModal abierto={mostrarTerminos} onCerrar={() => setMostrarTerminos(false)} />
    <form
      onSubmit={onSubmit}
      className="mx-auto grid w-full max-w-[460px] place-content-center gap-4 p-6 md:p-12"
    >
      <div className="mx-auto h-20 w-20">
        <Logo variant="icon" imgSize="h-40 w-40" className="-mt-10 -ml-10" />
      </div>

      <h2 className="text-3xl font-bold text-text-primary">Bounty Cuenta</h2>
      <p className="pb-2 text-text-secondary">
        Únete y comienza a acumular puntos
      </p>

      <Input
        label="Nombre completo"
        type="text"
        name="name"
        placeholder="Tu nombre"
        value={formData.name}
        onChange={onInputChange}
        maxLength={limiteCampos.nombre}
        error={fieldErrors.name}
        required
      />

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

      <Input
        label="Teléfono"
        type="tel"
        name="phone"
        placeholder="0999999999"
        value={formData.phone}
        onChange={onInputChange}
        maxLength={limiteCampos.telefono}
        error={fieldErrors.phone}
        required
      />

      <PasswordInput
        label="Contraseña"
        name="password"
        placeholder="Mínimo 6 caracteres"
        value={formData.password}
        onChange={onInputChange}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
        maxLength={limiteCampos.contrasena}
        error={fieldErrors.password}
        required
      />

      <PasswordInput
        label="Confirmar contraseña"
        name="confirmPassword"
        placeholder="Repite tu contraseña"
        value={formData.confirmPassword}
        onChange={onInputChange}
        showPassword={showConfirmPassword}
        onTogglePassword={onToggleConfirmPassword}
        maxLength={limiteCampos.contrasena}
        error={fieldErrors.confirmPassword}
        onPaste={(e) => e.preventDefault()}
        required
      />

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={aceptaTerminos}
          onChange={onToggleTerminos}
          className="mt-1 h-4 w-4 rounded border-slate-300 accent-primary"
        />
        <span className="text-sm text-text-secondary">
          Acepto los{' '}
          <button type="button" onClick={() => setMostrarTerminos(true)} className="text-primary font-medium hover:underline">
            terminos y condiciones
          </button>
          {' '}y la{' '}
          <button type="button" onClick={() => setMostrarTerminos(true)} className="text-primary font-medium hover:underline">
            politica de privacidad
          </button>
        </span>
      </label>
      {fieldErrors.terminos && (
        <p className="text-sm text-red-500">{fieldErrors.terminos}</p>
      )}

      {fieldErrors.general && (
        <p className="text-center text-sm text-red-500">{fieldErrors.general}</p>
      )}

      <Button
        type="submit"
        cargando={status.loading}
        className="w-full"
      >
        {status.loading ? 'Registrando...' : 'Crear cuenta'}
      </Button>

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
    </>
  )
}

export default RegisterForm
