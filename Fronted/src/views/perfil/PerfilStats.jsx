/**
 * PerfilStats Component
 * Tab de estadísticas del usuario
 */

import { Calendar, DollarSign, Heart, TrendingUp } from 'lucide-react'

const PerfilStats = ({ stats, formatDate }) => {
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

      {/* Logros */}
      <div className="rounded-2xl bg-surface-primary p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Logros Desbloqueados
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center rounded-xl bg-yellow-50 p-4 text-center">
            <span className="text-3xl">🌟</span>
            <p className="mt-2 text-xs font-medium text-yellow-700">
              Primera compra
            </p>
          </div>

          <div className="flex flex-col items-center rounded-xl bg-green-50 p-4 text-center">
            <span className="text-3xl">🎯</span>
            <p className="mt-2 text-xs font-medium text-green-700">
              10 visitas
            </p>
          </div>

          <div className="flex flex-col items-center rounded-xl bg-purple-50 p-4 text-center">
            <span className="text-3xl">💎</span>
            <p className="mt-2 text-xs font-medium text-purple-700">
              Nivel Oro
            </p>
          </div>
          
          <div className="flex flex-col items-center rounded-xl bg-surface-secondary p-4 text-center opacity-50">
            <span className="text-3xl">🏆</span>
            <p className="mt-2 text-xs font-medium text-text-muted">
              50 visitas
            </p>
          </div>

          <div className="flex flex-col items-center rounded-xl bg-surface-secondary p-4 text-center opacity-50">
            <span className="text-3xl">👑</span>
            <p className="mt-2 text-xs font-medium text-text-muted">
              Platino
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerfilStats
