/**
 * Select - Componente dropdown reutilizable
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = ({
  label,
  opciones = [],
  valor,
  placeholder = 'Selecciona una opción',
  onChange,
  requerido = false,
  error = false,
  mensajeError = '',
  icono: Icono = null,
  className = ''
}) => {
  const [abierto, setAbierto] = useState(false)

  // Buscar opción seleccionada
  const opcionSeleccionada = opciones.find(op => op.id === valor)

  // Manejar selección
  const seleccionar = (opcionId) => {
    onChange(opcionId)
    setAbierto(false)
  }

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label className="mb-1 flex items-center gap-2 font-medium text-input-label">
          {Icono && <Icono size={18} />}
          {label}
          {requerido && <span className="text-alert-error-text">*</span>}
        </label>
      )}

      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
            error
              ? 'border-alert-error-text bg-alert-error-bg'
              : 'border-input-border hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20'
          }`}
        >
          <span className={opcionSeleccionada ? 'text-text-primary' : 'text-input-placeholder'}>
            {opcionSeleccionada ? opcionSeleccionada.nombre : placeholder}
          </span>
          <ChevronDown
            size={20}
            className={`text-text-muted transition-transform ${abierto ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Lista de opciones */}
        {abierto && (
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-input-border bg-surface-primary shadow-lg">
            {opciones.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                onClick={() => seleccionar(opcion.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/10 ${
                  valor === opcion.id
                    ? 'bg-primary/20 font-medium text-primary'
                    : 'text-text-primary'
                }`}
              >
                {opcion.icono && <opcion.icono size={18} />}
                {opcion.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && mensajeError && (
        <p className="mt-2 text-sm text-alert-error-text">{mensajeError}</p>
      )}
    </div>
  )
}

export default Select
