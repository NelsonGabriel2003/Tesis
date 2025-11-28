/**
 * Input Component
 * Componente reutilizable para inputs de formulario
 */

const Input = ({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  onChange,
  required = false,
  autoComplete,
  className = ''
}) => {
  return (
    <div className="mb-[28px]">
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
        className={`w-full rounded-md border border-input-border px-4 py-3 placeholder-input-placeholder focus:border-input-focus focus:ring-2 focus:ring-input-focus ${className}`}
      />
    </div>
  )
}

export default Input