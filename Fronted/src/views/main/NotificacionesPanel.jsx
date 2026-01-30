/**
 * NotificacionesPanel Component
 * Panel de notificaciones usando contexto global
 */

import { Bell, X, PartyPopper, Sparkles, XCircle } from 'lucide-react'
import { useNotificaciones } from '../../contexts/NotificacionesContext'

const NotificacionesPanel = () => {
  const { notificaciones, eliminarNotificacion } = useNotificaciones()

  const getNotifStyles = (notif) => {
    if (notif.tipo === 'pedido_cancelado') {
      return {
        bg: 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        textColor: 'text-red-800',
        Icon: XCircle
      }
    }
    if (notif.esPrimeraCompra) {
      return {
        bg: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-800',
        Icon: Sparkles
      }
    }
    return {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      Icon: PartyPopper
    }
  }

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
          {notificaciones.map(notif => {
            const styles = getNotifStyles(notif)
            const Icon = styles.Icon

            return (
              <div
                key={notif.id}
                className={`rounded-xl p-4 relative border ${styles.bg}`}
              >
                <button
                  onClick={() => eliminarNotificacion(notif.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
                <div className="flex items-start gap-3">
                  <div className={`rounded-full p-2 ${styles.iconBg}`}>
                    <Icon size={20} className={styles.iconColor} />
                  </div>
                  <div className="flex-1 pr-4">
                    {notif.esPrimeraCompra && (
                      <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        Primera compra
                      </span>
                    )}
                    {notif.tipo === 'pedido_cancelado' && (
                      <span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        Cancelado
                      </span>
                    )}
                    <p className={`font-semibold text-sm mt-1 ${styles.textColor}`}>
                      {notif.mensaje}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Pedido #{notif.codigo} • ${notif.total}
                    </p>
                    {notif.tipo === 'pedido_cancelado' && notif.motivo && (
                      <p className="text-red-600 text-xs mt-2">
                        {notif.motivo}
                      </p>
                    )}
                    {notif.tipo !== 'pedido_cancelado' && notif.puntos > 0 && (
                      <p className="text-amber-600 text-xs mt-2 font-medium">
                        +{notif.puntos} puntos para tu proxima fiesta
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
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
