import { useState, useEffect } from 'react'

const alertStyles = {
  success: 'bg-alert-success-bg text-alert-success-text',
  error: 'bg-alert-error-bg text-alert-error-text',
  warning: 'bg-alert-warning-bg text-alert-warning-text',
  info: 'bg-alert-info-bg text-alert-info-text'
}

const Alert = ({ type = 'info', message, duracion = 5000, onClose }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    if (!duracion) return

    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duracion)

    return () => clearTimeout(timer)
  }, [message, duracion, onClose])

  if (!message || !visible) return null

  return (
    <p className={`mb-4 rounded-md p-3 text-center ${alertStyles[type]}`}>
      {message}
    </p>
  )
}

export default Alert