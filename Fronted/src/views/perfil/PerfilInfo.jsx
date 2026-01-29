/**
 * PerfilInfo - Muestra y edita información personal del usuario
 */

import { Edit2, Save, X, Mail, Phone, User, Loader } from 'lucide-react'

const PerfilInfo = ({
  usuario,
  estaEditando,
  datosFormulario,
  estaCargando,
  alEditar,
  alCancelar,
  alGuardar,
  alCambiar
}) => {
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

        {!estaEditando ? (
          <button
            onClick={alEditar}
            className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Edit2 size={16} />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={alCancelar}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-200"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={alGuardar}
              disabled={estaCargando}
              className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
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
                    className="w-full rounded-xl border border-input-border bg-surface-secondary py-3 pl-10 pr-4 text-text-primary placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <div className="w-full rounded-xl bg-surface-secondary py-3 pl-10 pr-4 text-text-primary">
                    {usuario[campo.id]}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PerfilInfo
