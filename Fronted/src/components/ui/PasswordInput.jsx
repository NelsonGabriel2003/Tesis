import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const PasswordInput = ({
  label,
  name,
  value,
  placeholder = '******',
  onChange,
  showPassword,
  onTogglePassword,
  required = false,
  maxLength,
  error,
  onPaste
}) => {
  const [bordeRojo, setBordeRojo] = useState(false)

  useEffect(() => {
    if (error) {
      setBordeRojo(true)
      const timer = setTimeout(() => setBordeRojo(false), 5000)
      return () => clearTimeout(timer)
    }
    setBordeRojo(false)
  }, [error])

  return (
    <div>
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
          maxLength={maxLength}
          onPaste={onPaste}
          className={`w-full rounded-md border bg-white px-4 py-3 pr-12 placeholder-input-placeholder shadow-sm transition-colors duration-300 ${bordeRojo ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:border-input-focus focus:ring-2 focus:ring-input-focus'}`}
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
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default PasswordInput