/**
 * PerfilPoints Component
 * Tab de historial de puntos
 */

import { Star, TrendingUp, TrendingDown, Gift } from 'lucide-react'

const PerfilPoints = ({ points, formatDate }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned':
        return <TrendingUp size={18} className="text-green-500" />
      case 'redeemed':
        return <TrendingDown size={18} className="text-red-500" />
      case 'bonus':
        return <Gift size={18} className="text-purple-500" />
      default:
        return <Star size={18} className="text-yellow-500" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earned':
        return 'text-green-600 bg-green-50'
      case 'redeemed':
        return 'text-red-600 bg-red-50'
      case 'bonus':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  return (
    <div className="space-y-4">
      {/* Resumen de puntos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-surface-primary p-4 shadow-md">
          <p className="text-sm text-text-muted">Puntos actuales</p>
          <p className="text-2xl font-bold text-primaryClr">
            {points.current.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-surface-primary p-4 shadow-md">
          <p className="text-sm text-text-muted">Puntos totales</p>
          <p className="text-2xl font-bold text-text-primary">
            {points.total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Historial */}
      <div className="rounded-2xl bg-surface-primary p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Historial de Movimientos
        </h3>

        {points.history.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary text-3xl">
              📋
            </div>
            <p className="text-text-muted">No hay movimientos aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {points.history.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 rounded-xl bg-surface-secondary p-3 transition-colors hover:bg-gray-100"
              >
                {/* Icono */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  transaction.type === 'earned' ? 'bg-green-100' :
                  transaction.type === 'redeemed' ? 'bg-red-100' :
                  'bg-purple-100'
                }`}>
                  {getTransactionIcon(transaction.type)}
                </div>

                {/* Descripción */}
                <div className="flex-1">
                  <p className="font-medium text-text-primary">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-text-muted">
                    {formatDate(transaction.date)}
                  </p>
                </div>

                {/* Puntos */}
                <div className={`rounded-full px-3 py-1 text-sm font-bold ${getTransactionColor(transaction.type)}`}>
                  {transaction.points > 0 ? '+' : ''}{transaction.points}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PerfilPoints
