/**
 * PasswordInput Component
 * Input de password con toggle de visibilidad
 */

import { Eye, EyeOff } from 'lucide-react'

const PasswordInput = ({
  label,
  name,
  value,
  placeholder = '******',
  onChange,
  showPassword,
  onTogglePassword,
  required = false
}) => {
  return (
    <div className="mb-[28px]">
      {label && (
        <label className="mb-1 block font-medium text-input-label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          autoComplete="current-password"
          className="w-full rounded-md border border-input-border px-4 py-3 pr-12 placeholder-input-placeholder focus:border-input-focus focus:ring-2 focus:ring-input-focus"
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? <Eye size={24} /> : <EyeOff size={24} />}
        </button>
      </div>
    </div>
  )
}

export default PasswordInput