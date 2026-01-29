/**
 * NotificacionesPanel Component
 * Panel de notificaciones usando contexto global
 */

import { Bell, X, PartyPopper, Sparkles } from 'lucide-react'
import { useNotificaciones } from '../../contexts/NotificacionesContext'

const NotificacionesPanel = () => {
  const { notificaciones, eliminarNotificacion } = useNotificaciones()

  return (
    <div className="relative">
      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-primary">
        <div className="relative">
          <Bell size={20} className="text-primary" />
          {notificaciones.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificaciones.length}
            </span>
          )}
        </div>
        <span>Notificaciones</span>
      </div>

      {notificaciones.length > 0 ? (
        <div className="mt-2 space-y-2 px-2">
          {notificaciones.map(notif => (
            <div
              key={notif.id}
              className={`rounded-xl p-4 relative border ${
                notif.esPrimeraCompra
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              }`}
            >
              <button
                onClick={() => eliminarNotificacion(notif.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
              <div className="flex items-start gap-3">
                <div className={`rounded-full p-2 ${
                  notif.esPrimeraCompra ? 'bg-purple-100' : 'bg-green-100'
                }`}>
                  {notif.esPrimeraCompra
                    ? <Sparkles size={20} className="text-purple-600" />
                    : <PartyPopper size={20} className="text-green-600" />
                  }
                </div>
                <div className="flex-1 pr-4">
                  {notif.esPrimeraCompra && (
                    <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      Primera compra
                    </span>
                  )}
                  <p className={`font-semibold text-sm mt-1 ${
                    notif.esPrimeraCompra ? 'text-purple-800' : 'text-green-800'
                  }`}>
                    {notif.mensaje}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Pedido #{notif.codigo} • ${notif.total}
                  </p>
                  {notif.puntos > 0 && (
                    <p className="text-amber-600 text-xs mt-2 font-medium">
                      +{notif.puntos} puntos para tu proxima fiesta
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted px-4 py-2">
          Sin notificaciones
        </p>
      )}
    </div>
  )
}

export default NotificacionesPanel
