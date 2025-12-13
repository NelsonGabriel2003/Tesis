/**
 * PerfilHeader Component
 * Cabecera del perfil con avatar y nivel
 */

import { Star } from 'lucide-react'

const PerfilHeader = ({ user, membershipInfo, progress, formatDate }) => {
  return (
    <div className="rounded-2xl bg-surface-primary p-6 shadow-lg">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primaryClr to-purple-600 text-3xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {/* Badge de nivel */}
          <div className={`absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full ${membershipInfo?.color || 'bg-gray-400'} text-lg shadow-md`}>
            {membershipInfo?.icon || '🥉'}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text-primary">{user.name}</h2>
          <p className="text-sm text-text-muted">{user.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full ${membershipInfo?.color || 'bg-gray-400'} px-2 py-0.5 text-xs font-bold text-white`}>
              {membershipInfo?.name || 'Bronce'}
            </span>
            <span className="text-xs text-text-muted">
              desde {formatDate(user.memberSince)}
            </span>
          </div>
        </div>
      </div>

      {/* Puntos y progreso */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-500" fill="currentColor" />
            <span className="text-2xl font-bold text-text-primary">
              {user.points.current.toLocaleString()}
            </span>
            <span className="text-text-muted">puntos</span>
          </div>
        </div>

        {/* Barra de progreso */}
        {progress && progress.pointsNeeded > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Progreso a {progress.nextLevelName}</span>
              <span>{Math.round(progress.percentage)}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primaryClr to-purple-500 transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {progress.pointsNeeded.toLocaleString()} puntos más para subir de nivel
            </p>
          </div>
        )}

        {progress && progress.pointsNeeded === 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-50 p-3">
            <span className="text-2xl">💎</span>
            <span className="text-sm font-medium text-yellow-700">
              ¡Felicidades! Has alcanzado el nivel máximo
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerfilHeader
