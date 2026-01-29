/**
 * PerfilPoints - Historial de puntos del usuario
 */

import { Star, TrendingUp, TrendingDown, Gift } from 'lucide-react'

const PerfilPoints = ({ puntos, formatearFecha }) => {
  // Obtener icono según tipo de transacción
  const obtenerIcono = (tipo) => {
    switch (tipo) {
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

  // Obtener color según tipo de transacción
  const obtenerColor = (tipo) => {
    switch (tipo) {
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

  // Obtener color de fondo del icono
  const obtenerFondoIcono = (tipo) => {
    switch (tipo) {
      case 'earned':
        return 'bg-green-100'
      case 'redeemed':
        return 'bg-red-100'
      default:
        return 'bg-purple-100'
    }
  }

  return (
    <div className="space-y-4">
      {/* Resumen de puntos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-surface-primary p-4 shadow-md">
          <p className="text-sm text-text-muted">Puntos actuales</p>
          <p className="text-2xl font-bold text-primary">
            {puntos.current.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-surface-primary p-4 shadow-md">
          <p className="text-sm text-text-muted">Puntos totales</p>
          <p className="text-2xl font-bold text-text-primary">
            {puntos.total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Historial de movimientos */}
      <div className="rounded-2xl bg-surface-primary p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">
          Historial de Movimientos
        </h3>

        {puntos.history.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary text-3xl">
              📋
            </div>
            <p className="text-text-muted">No hay movimientos aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {puntos.history.map((transaccion) => (
              <div
                key={transaccion.id}
                className="flex items-center gap-4 rounded-xl bg-surface-secondary p-3 transition-colors hover:bg-gray-100"
              >
                {/* Icono */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${obtenerFondoIcono(transaccion.type)}`}>
                  {obtenerIcono(transaccion.type)}
                </div>

                {/* Descripción */}
                <div className="flex-1">
                  <p className="font-medium text-text-primary">
                    {transaccion.description}
                  </p>
                  <p className="text-sm text-text-muted">
                    {formatearFecha(transaccion.date)}
                  </p>
                </div>

                {/* Puntos */}
                <div className={`rounded-full px-3 py-1 text-sm font-bold ${obtenerColor(transaccion.type)}`}>
                  {transaccion.points > 0 ? '+' : ''}{transaccion.points}
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
