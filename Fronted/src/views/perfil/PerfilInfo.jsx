/**
 * PerfilInfo - Muestra y edita información personal del usuario
 */

import { Edit2, Save, X, Mail, Phone, User, Loader } from 'lucide-react'

const PerfilInfo = ({
  usuario,
  estaEditando,
  datosFormulario,
  erroresCampos = {},
  estaCargando,
  alEditar,
  alCancelar,
  alGuardar,
  alCambiar
}) => {
  const tieneErrores = Object.values(erroresCampos).some(e => e)

  // Configuración de campos - email no editable por seguridad
  const campos = [
    { id: 'name', etiqueta: 'Nombre', icono: User, tipo: 'text', editable: true },
    { id: 'email', etiqueta: 'Email', icono: Mail, tipo: 'email', editable: false },
    { id: 'phone', etiqueta: 'Teléfono', icono: Phone, tipo: 'tel', editable: true }
  ]

  return (
    <div className="rounded-2xl bg-surface-primary p-6 shadow-md">
      {/* Encabezado */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Información Personal
        </h3>

        {!estaEditando && (
          <button
            onClick={alEditar}
            className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Edit2 size={16} />
            Editar
          </button>
        )}
      </div>

      {/* Campos del formulario */}
      <div className="space-y-4">
        {campos.map((campo) => {
          const Icono = campo.icono
          const puedeEditar = estaEditando && campo.editable

          return (
            <div key={campo.id}>
              <label className="mb-1 block text-sm text-text-muted">
                {campo.etiqueta}
                {!campo.editable && estaEditando && (
                  <span className="ml-2 text-xs text-text-muted">(No editable)</span>
                )}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <Icono size={18} />
                </div>
                {puedeEditar ? (
                  <input
                    type={campo.tipo}
                    value={datosFormulario[campo.id] || ''}
                    onChange={(e) => alCambiar(campo.id, e.target.value)}
                    className={`w-full rounded-xl border bg-surface-secondary py-3 pl-10 pr-4 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 ${
                      erroresCampos[campo.id]
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                        : 'border-input-border focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                ) : (
                  <div className={`w-full rounded-xl bg-surface-secondary py-3 pl-10 pr-4 text-text-primary${campo.id === 'name' ? ' capitalize' : ''}`}>
                    {usuario[campo.id]}
                  </div>
                )}
              </div>
              {puedeEditar && erroresCampos[campo.id] && (
                <p className="mt-1 text-xs text-red-500">{erroresCampos[campo.id]}</p>
              )}
            </div>
          )
        })}

        {/* Botones Cancelar / Guardar debajo de los campos */}
        {estaEditando && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={alCancelar}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-100 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-200"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={alGuardar}
              disabled={estaCargando || tieneErrores}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {estaCargando ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerfilInfo
