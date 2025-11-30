/**
 * ServicioModal Component
 * Modal de detalle y reserva de servicio
 */

import { X, Star, Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react'

const ServicioModal = ({
  service,
  canUse,
  userPoints,
  reservationStatus,
  onReserve,
  onClose
}) => {
  const pointsNeeded = service.pointsRequired - userPoints

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-surface-primary p-6 shadow-xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primaryClr/10 text-4xl">
              {service.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {service.name}
              </h2>
              <p className="text-sm text-text-muted">{service.category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <X size={24} />
          </button>
        </div>

        {/* Descripción */}
        <p className="mt-4 text-text-secondary">
          {service.description}
        </p>

        {/* Info de puntos */}
        <div className="mt-6 space-y-3">
          {/* Puntos requeridos */}
          {service.pointsRequired > 0 && (
            <div className={`flex items-center justify-between rounded-xl p-4 ${
              canUse ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                {canUse ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <Lock size={20} className="text-red-500" />
                )}
                <span className={canUse ? 'text-green-700' : 'text-red-600'}>
                  Puntos requeridos
                </span>
              </div>
              <span className={`font-bold ${canUse ? 'text-green-700' : 'text-red-600'}`}>
                {service.pointsRequired} pts
              </span>
            </div>
          )}

          {/* Puntos que gana */}
          <div className="flex items-center justify-between rounded-xl bg-yellow-50 p-4">
            <div className="flex items-center gap-2">
              <Star size={20} className="text-yellow-600" fill="currentColor" />
              <span className="text-yellow-700">Puntos que ganas</span>
            </div>
            <span className="font-bold text-yellow-700">+{service.pointsReward} pts</span>
          </div>

          {/* Tus puntos actuales */}
          <div className="flex items-center justify-between rounded-xl bg-surface-secondary p-4">
            <span className="text-text-secondary">Tus puntos actuales</span>
            <span className="font-bold text-text-primary">{userPoints.toLocaleString()} pts</span>
          </div>

          {/* Puntos faltantes */}
          {!canUse && pointsNeeded > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-orange-50 p-4">
              <AlertCircle size={20} className="text-orange-500" />
              <span className="text-orange-700">
                Te faltan <strong>{pointsNeeded}</strong> puntos para este servicio
              </span>
            </div>
          )}
        </div>

        {/* Estado de reserva */}
        {reservationStatus?.success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-4">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <p className="font-medium text-green-700">¡Reserva exitosa!</p>
              <p className="text-sm text-green-600">
                Código: {reservationStatus.data.reservationId}
              </p>
            </div>
          </div>
        )}

        {reservationStatus?.error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-4">
            <AlertCircle size={20} className="text-red-500" />
            <span className="text-red-600">{reservationStatus.error}</span>
          </div>
        )}

        {/* Botones */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-gray-300 py-3 font-semibold text-text-secondary transition-colors hover:bg-surface-secondary"
          >
            Cerrar
          </button>

          {!reservationStatus?.success && (
            <button
              onClick={() => onReserve(service.id)}
              disabled={!service.available || !canUse || reservationStatus?.loading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-semibold text-white transition-colors ${
                service.available && canUse
                  ? 'bg-primaryClr hover:bg-primaryClr/90'
                  : 'cursor-not-allowed bg-gray-300'
              }`}
            >
              {reservationStatus?.loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Reservando...
                </>
              ) : (
                'Reservar'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServicioModal
