/**
 * CodigoInput - Input para código de verificación alfanumérico
 */

import { useRef, useState } from 'react'

const CodigoInput = ({
  longitud = 6,
  valor = '',
  onChange,
  error = false,
  disabled = false
}) => {
  const inputsRef = useRef([])
  const [valores, setValores] = useState(Array(longitud).fill(''))

  // Manejar cambio en cada input
  const manejarCambio = (indice, valorInput) => {
    const nuevoValor = valorInput.toUpperCase().replace(/[^A-Z0-9]/g, '')

    if (nuevoValor.length <= 1) {
      const nuevosValores = [...valores]
      nuevosValores[indice] = nuevoValor
      setValores(nuevosValores)

      // Notificar cambio
      onChange(nuevosValores.join(''))

      // Mover al siguiente input si escribió algo
      if (nuevoValor && indice < longitud - 1) {
        inputsRef.current[indice + 1]?.focus()
      }
    }
  }

  // Manejar tecla presionada
  const manejarTecla = (indice, evento) => {
    // Retroceder con Backspace
    if (evento.key === 'Backspace' && !valores[indice] && indice > 0) {
      inputsRef.current[indice - 1]?.focus()
    }
  }

  // Manejar pegado de código completo
  const manejarPegar = (evento) => {
    evento.preventDefault()
    const textoPegado = evento.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '')

    if (textoPegado.length > 0) {
      const nuevosValores = Array(longitud).fill('')
      for (let i = 0; i < Math.min(textoPegado.length, longitud); i++) {
        nuevosValores[i] = textoPegado[i]
      }
      setValores(nuevosValores)
      onChange(nuevosValores.join(''))

      // Enfocar último input lleno o el siguiente vacío
      const ultimoIndice = Math.min(textoPegado.length, longitud) - 1
      inputsRef.current[ultimoIndice]?.focus()
    }
  }

  return (
    <div className="flex justify-center gap-2">
      {valores.map((val, indice) => (
        <input
          key={indice}
          ref={(el) => (inputsRef.current[indice] = el)}
          type="text"
          maxLength={1}
          value={val}
          onChange={(e) => manejarCambio(indice, e.target.value)}
          onKeyDown={(e) => manejarTecla(indice, e)}
          onPaste={manejarPegar}
          disabled={disabled}
          className={`h-12 w-12 rounded-xl border-2 text-center text-xl font-bold uppercase transition-colors
            ${error
              ? 'border-alert-error-text bg-alert-error-bg text-alert-error-text'
              : 'border-input-border bg-surface-primary text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        />
      ))}
    </div>
  )
}

export default CodigoInput
