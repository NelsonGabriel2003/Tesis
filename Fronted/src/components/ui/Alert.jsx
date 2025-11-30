/**
 * Alert Component
 * Componente reutilizable para mostrar mensajes de éxito/error
 */

const alertStyles = {
  success: 'bg-alert-success-bg text-alert-success-text',
  error: 'bg-alert-error-bg text-alert-error-text',
  warning: 'bg-alert-warning-bg text-alert-warning-text',
  info: 'bg-alert-info-bg text-alert-info-text'
}

const Alert = ({ type = 'info', message }) => {
  if (!message) return null

  return (
    <p className={`mb-4 rounded-md p-3 text-center ${alertStyles[type]}`}>
      {message}
    </p>
  )
}

export default Alert