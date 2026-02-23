import { useState, useEffect } from 'react'

const Input = ({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  onChange,
  required = false,
  autoComplete,
  maxLength,
  className = '',
  error
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
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={`w-full rounded-md border bg-white px-4 py-3 placeholder-input-placeholder shadow-sm transition-colors duration-300 ${bordeRojo ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:border-input-focus focus:ring-2 focus:ring-input-focus'} ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default Input