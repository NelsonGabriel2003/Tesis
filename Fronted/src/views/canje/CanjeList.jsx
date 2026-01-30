/**
 * CanjeList Component
 * Lista de recompensas canjeables
 */

import { Star, Lock, TrendingUp } from 'lucide-react'

const CanjeList = ({ rewards, loading, onSelectReward, canRedeem, userPoints }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="animate-pulse rounded-2xl bg-surface-primary p-4 shadow-md"
          >
            <div className="mb-3 h-24 rounded-xl bg-surface-secondary" />
            <div className="mb-2 h-4 w-3/4 rounded bg-surface-secondary" />
            <div className="mb-3 h-3 w-1/2 rounded bg-surface-secondary" />
            <div className="h-8 rounded-full bg-surface-secondary" />
          </div>
        ))}
      </div>
    )
  }

  if (rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-6xl">🎁</div>
        <h3 className="mb-2 text-lg font-semibold text-text-primary">
          No hay recompensas
        </h3>
        <p className="text-text-muted">
          No se encontraron recompensas en esta categoría
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {rewards.map((reward) => {
        const canRedeemReward = canRedeem(reward)
        const pointsNeeded = reward.pointsCost - userPoints

        return (
          <button
            key={reward.id}
            onClick={() => onSelectReward(reward)}
            className={`group overflow-hidden rounded-2xl bg-surface-primary text-left shadow-md
              transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              !canRedeemReward ? 'opacity-80' : ''
            }`}
          >
            {/* Imagen responsive */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              {reward.imageUrl ? (
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600
                  flex items-center justify-center">
                  <span className="text-4xl drop-shadow-lg">
                    {reward.category?.toLowerCase() === 'bebidas' && '🍹'}
                    {reward.category?.toLowerCase() === 'comida' && '🍕'}
                    {reward.category?.toLowerCase() === 'descuentos' && '💰'}
                    {reward.category?.toLowerCase() === 'experiencias' && '⭐'}
                    {!['bebidas', 'comida', 'descuentos', 'experiencias'].includes(reward.category?.toLowerCase()) && '🎁'}
                  </span>
                </div>
              )}

              {/* Overlay gradient para mejor legibilidad de badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

              {/* Badge popular */}
              {reward.popular && (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-500 px-2 py-1
                  text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                  <TrendingUp size={12} />
                  Popular
                </div>
              )}

              {/* Badge stock bajo */}
              {reward.stock <= 10 && reward.stock > 0 && (
                <div className="absolute right-2 top-2 rounded-full bg-orange-500 px-2 py-1
                  text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                  ¡Quedan {reward.stock}!
                </div>
              )}

              {/* Agotado */}
              {reward.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                    Agotado
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="mb-1 text-sm font-semibold text-text-primary line-clamp-1">
                {reward.name}
              </h3>
              <p className="mb-2 text-xs text-text-muted line-clamp-2">
                {reward.description}
              </p>

              {/* Precio en puntos */}
              <div className={`flex items-center justify-between rounded-full px-3 py-1.5 ${
                canRedeemReward
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <div className="flex items-center gap-1">
                  {canRedeemReward ? (
                    <Star size={14} fill="currentColor" />
                  ) : (
                    <Lock size={14} />
                  )}
                  <span className="text-sm font-bold">
                    {reward.pointsCost.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs">pts</span>
              </div>

              {/* Puntos faltantes */}
              {!canRedeemReward && pointsNeeded > 0 && (
                <p className="mt-2 text-center text-xs text-red-500">
                  Te faltan {pointsNeeded} pts
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default CanjeList
