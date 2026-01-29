/**
 * Button - Componente reutilizable para botones
 */

import { Loader } from 'lucide-react'

const Button = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  cargando = false,
  variante = 'primary',
  fullWidth = false,
  className = ''
}) => {
  const estilosBase = 'rounded-xl px-4 py-3 font-medium transition-colors duration-200 flex items-center justify-center gap-2'

  const variantes = {
    primary: 'bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover',
    secondary: 'bg-btn-secondary-bg text-btn-secondary-text hover:bg-btn-secondary-hover',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    success: 'bg-green-500 text-white hover:bg-green-600',
    danger: 'bg-alert-error-text text-white hover:bg-red-800',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-secondary'
  }

  // Estilos cuando está deshabilitado
  const estilosDeshabilitado = disabled || cargando
    ? 'opacity-50 cursor-not-allowed'
    : ''

  // Estilos de ancho completo
  const estilosAncho = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || cargando}
      className={`${estilosBase} ${variantes[variante]} ${estilosDeshabilitado} ${estilosAncho} ${className}`}
    >
      {cargando ? (
        <>
          <Loader size={20} className="animate-spin" />
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
