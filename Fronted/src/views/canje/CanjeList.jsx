/**
 * CanjeList Component
 * Lista de recompensas canjeables
 */

import { Star, Lock, TrendingUp } from 'lucide-react'

const CanjeList = ({ rewards, loading, onSelectReward, canRedeem, userPoints }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
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
            className={`overflow-hidden rounded-2xl bg-surface-primary text-left shadow-md transition-all hover:shadow-lg ${
              !canRedeemReward ? 'opacity-75' : ''
            }`}
          >
            {/* Imagen placeholder */}
            <div className="relative h-24 bg-gradient-to-br from-primaryClr/20 to-purple-500/20">
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                {reward.category === 'bebidas' && '🍹'}
                {reward.category === 'comida' && '🍕'}
                {reward.category === 'descuentos' && '💰'}
                {reward.category === 'experiencias' && '⭐'}
              </div>

              {/* Badge popular */}
              {reward.popular && (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  <TrendingUp size={10} />
                  Popular
                </div>
              )}

              {/* Badge stock bajo */}
              {reward.stock <= 10 && reward.stock > 0 && (
                <div className="absolute right-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                  ¡Quedan {reward.stock}!
                </div>
              )}

              {/* Agotado */}
              {reward.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
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
                  ? 'bg-primaryClr/10 text-primaryClr'
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
