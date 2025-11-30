/**
 * Button Component
 * Componente reutilizable para botones
 */

const Button = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  className = ''
}) => {
  const baseStyles = 'rounded-xl px-4 py-3 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover',
    secondary: 'bg-btn-secondary-bg text-btn-secondary-text hover:bg-btn-secondary-hover',
    outline: 'border-2 border-primaryClr text-primaryClr hover:bg-primaryClr hover:text-white'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? 'Cargando...' : children}
    </button>
  )
}

export default Button