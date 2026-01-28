/**
 * PerfilInfo Component
 * Tab de información personal
 */

import { Edit2, Save, X, Mail, Phone, User, Loader } from 'lucide-react'

const PerfilInfo = ({
  user,
  isEditing,
  editData,
  loading,
  onEdit,
  onCancel,
  onSave,
  onChange
}) => {
  const fields = [
    { id: 'name', label: 'Nombre', icon: User, type: 'text' },
    { id: 'email', label: 'Email', icon: Mail, type: 'email' },
    { id: 'phone', label: 'Teléfono', icon: Phone, type: 'tel' }
  ]

  return (
    <div className="rounded-2xl bg-surface-primary p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Información Personal
        </h3>

        {!isEditing ? (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Edit2 size={16} />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-200"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field) => {
          const IconComponent = field.icon
          return (
            <div key={field.id}>
              <label className="mb-1 block text-sm text-text-muted">
                {field.label}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <IconComponent size={18} />
                </div>
                {isEditing ? (
                  <input
                    type={field.type}
                    value={editData[field.id] || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="w-full rounded-xl border border-input-border bg-surface-secondary py-3 pl-10 pr-4 text-text-primary placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <div className="w-full rounded-xl bg-surface-secondary py-3 pl-10 pr-4 text-text-primary">
                    {user[field.id]}
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
