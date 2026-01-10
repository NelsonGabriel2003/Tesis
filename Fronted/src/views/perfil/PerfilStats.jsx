/**
 * PerfilStats Component
 * Tab de estadísticas del usuario
 */

import { useState, useEffect } from 'react'
import { Calendar, DollarSign, Heart, TrendingUp, Gift, Loader } from 'lucide-react'
import { rewardService } from '../../services/admin/adminServices'

const PerfilStats = ({ stats, formatDate, userPoints = 0 }) => {
  const [nearRewards, setNearRewards] = useState([])
  const [loadingRewards, setLoadingRewards] = useState(true)

  // Cargar recompensas cercanas
  useEffect(() => {
    const loadNearRewards = async () => {
      try {
        const allRewards = await rewardService.getAll()
        // Filtrar y ordenar por cercanía a los puntos del usuario
        const sorted = allRewards
          .filter(r => r.isAvailable)
          .map(r => ({
            ...r,
            canRedeem: userPoints >= r.pointsCost,
            pointsNeeded: Math.max(0, r.pointsCost - userPoints)
          }))
          .sort((a, b) => a.pointsNeeded - b.pointsNeeded)
          .slice(0, 3) // Solo las 3 más cercanas
        
        setNearRewards(sorted)
      } catch (error) {
        console.error('Error cargando recompensas:', error)
      } finally {
        setLoadingRewards(false)
      }
    }

    loadNearRewards()
  }, [userPoints])

  const statItems = [
    {
      id: 'visits',
      label: 'Visitas Al Local',
      value: stats.totalVisits,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'spent',
      label: 'Total gastado',
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'favorite',
      label: 'Favorito',
      value: stats.favoriteItem,
      icon: Heart,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'lastVisit',
      label: 'Última compra',
      value: formatDate(stats.lastVisit),
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        {statItems.map((stat) => {
          const IconComponent = stat.icon
          return (
            <div
              key={stat.id}
              className="rounded-2xl bg-surface-primary p-4 shadow-md"
            >
              <div className={`mb-3 inline-flex rounded-xl ${stat.color} p-3`}>
                <IconComponent size={24} />
              </div>
              <p className="text-sm text-text-muted">{stat.label}</p>
              <p className="mt-1 text-lg font-bold text-text-primary">
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Próximas Recompensas */}
      <div className="rounded-2xl bg-surface-primary p-6 shadow-md">
        <div className="mb-4 flex items-center gap-2">
          <Gift className="text-primaryClr" size={24} />
          <h3 className="text-lg font-semibold text-text-primary">
            Próximas Recompensas
          </h3>
        </div>

        {loadingRewards ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin text-primaryClr" size={32} />
          </div>
        ) : nearRewards.length === 0 ? (
          <p className="text-center text-text-muted py-4">
            No hay recompensas disponibles
          </p>
        ) : (
          <div className="space-y-3">
            {nearRewards.map((reward) => (
              <div
                key={reward.id}
                className={`flex items-center gap-4 rounded-xl p-4 ${
                  reward.canRedeem 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-surface-secondary'
                }`}
              >
                <div className="text-3xl">
                  {reward.category === 'Bebidas' && '🍺'}
                  {reward.category === 'Comida' && '🍔'}
                  {reward.category === 'Descuentos' && '💰'}
                  {reward.category === 'Experiencias' && '⭐'}
                  {!['Bebidas', 'Comida', 'Descuentos', 'Experiencias'].includes(reward.category) && '🎁'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{reward.name}</p>
                  <p className="text-sm text-text-muted">{reward.pointsCost} pts</p>
                </div>
                <div className="text-right">
                  {reward.canRedeem ? (
                    <span className="text-sm font-medium text-green-600">
                      ¡Disponible!
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted">
                      Te faltan {reward.pointsNeeded} pts
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PerfilStats