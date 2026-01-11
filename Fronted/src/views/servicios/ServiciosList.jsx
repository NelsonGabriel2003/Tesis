/**
 * ServiciosList Component
 * Lista de servicios disponibles
 */

import { Star, Lock, ChevronRight } from 'lucide-react'

// Iconos por categoría (fallback si no hay imagen)
const CATEGORY_ICONS = {
  'reservas': '🪑',
  'eventos': '🎉',
  'entretenimiento': '🎵',
  'vip': '⭐',
  'exclusivo': '⭐',
  'delivery': '🚗',
  'default': '📋'
}

const getIconByCategory = (category) => {
  const key = category?.toLowerCase() || 'default'
  return CATEGORY_ICONS[key] || CATEGORY_ICONS['default']
}

const ServiciosList = ({ services, loading, onSelectService, canUseService, userPoints }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="animate-pulse rounded-2xl bg-surface-primary p-4 shadow-md "
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-surface-secondary" />
              <div className="flex-1">
                <div className="mb-2 h-5 w-3/4 rounded bg-surface-secondary" />
                <div className="h-4 w-1/2 rounded bg-surface-secondary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-6xl">🛎️</div>
        <h3 className="mb-2 text-lg font-semibold text-text-primary">
          No hay servicios
        </h3>
        <p className="text-text-muted">
          No se encontraron servicios en esta categoría
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {services.map((service) => {
        const canUse = canUseService(service)
        const pointsNeeded = service.pointsRequired - userPoints

        return (
          <button
            key={service.id}
            onClick={() => onSelectService(service)}
            disabled={!service.available}
            className={`w-full rounded-2xl bg-surface-primary p-4 text-left shadow-md transition-all hover:shadow-lg ${
              !service.available ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Imagen o Icono */}
              <div className={`flex h-16 w-16 items-center justify-center rounded-xl overflow-hidden ${
                canUse ? 'bg-primaryClr/10' : 'bg-gray-100'
              }`}>
                {service.imageUrl ? (
                  <img 
                    src={service.imageUrl} 
                    alt={service.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{getIconByCategory(service.category)}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">
                    {service.name}
                  </h3>
                  {!service.available && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                      No disponible
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-text-muted line-clamp-2">
                  {service.description}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {/* Puntos requeridos */}
                  {service.pointsRequired > 0 && (
                    <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      canUse
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {canUse ? (
                        <Star size={12} fill="currentColor" />
                      ) : (
                        <Lock size={12} />
                      )}
                      {service.pointsRequired} pts requeridos
                    </div>
                  )}

                  {/* Puntos que gana */}
                  <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    <Star size={12} fill="currentColor" />
                    +{service.pointsReward} pts
                  </div>
                </div>

                {/* Mensaje de puntos faltantes */}
                {!canUse && service.pointsRequired > 0 && pointsNeeded > 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    Te faltan {pointsNeeded} puntos
                  </p>
                )}
              </div>

              {/* Flecha */}
              <ChevronRight size={20} className="text-text-muted" />
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ServiciosList