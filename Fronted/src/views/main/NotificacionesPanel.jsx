/**
 * NotificacionesPanel Component
 * Panel de notificaciones para pedidos completados
 * Usa polling para detectar cambios de estado
 */

import { useState, useEffect, useCallback } from 'react'
import { Bell, X, PartyPopper, Sparkles } from 'lucide-react'
import { orderServices } from '../../services/order/orderServices'

const POLLING_INTERVAL = 5000

// Mensajes para primera compra
const MENSAJES_PRIMERA_COMPRA = [
  'Bienvenido a la fiesta! Tu primera ronda esta lista',
  'Oficialmente eres parte del crew! Disfruta tu primera',
  'Primera compra completada! Que empiece la noche'
]

// Mensajes para compras regulares
const MENSAJES_REGULARES = [
  'Tu pedido esta listo! A pasarla bien',
  'Listo para seguir la fiesta! Disfruta',
  'Pedido completado! La noche es joven',
  'Ya esta tu pedido! A bailar se ha dicho',
  'Servido! Que siga la buena vibra'
]

const obtenerMensaje = (esPrimeraCompra) => {
  const mensajes = esPrimeraCompra ? MENSAJES_PRIMERA_COMPRA : MENSAJES_REGULARES
  const indice = Math.floor(Math.random() * mensajes.length)
  return mensajes[indice]
}

const NotificacionesPanel = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [pedidosAnteriores, setPedidosAnteriores] = useState({})
  const [primeraCarga, setPrimeraCarga] = useState(true)
  const [totalPedidosCompletados, setTotalPedidosCompletados] = useState(0)

  const verificarPedidos = useCallback(async () => {
    try {
      const respuesta = await orderServices.getMyOrders(20)
      const pedidos = respuesta.data || []

      // Contar pedidos completados para saber si es primera compra
      const completados = pedidos.filter(p => p.status === 'completed' || p.status === 'delivered')
      setTotalPedidosCompletados(completados.length)

      if (!primeraCarga) {
        pedidos.forEach(pedido => {
          const estadoAnterior = pedidosAnteriores[pedido.id]

          if (pedido.status === 'completed' && estadoAnterior && estadoAnterior !== 'completed') {
            const esPrimeraCompra = completados.length === 1
            const nuevaNotificacion = {
              id: Date.now(),
              pedidoId: pedido.id,
              codigo: pedido.order_code,
              mensaje: obtenerMensaje(esPrimeraCompra),
              puntos: pedido.points_earned || pedido.points_to_earn,
              total: pedido.total,
              esPrimeraCompra,
              fecha: new Date()
            }
            setNotificaciones(prev => [nuevaNotificacion, ...prev])
          }
        })
      }

      const nuevosEstados = {}
      pedidos.forEach(p => { nuevosEstados[p.id] = p.status })
      setPedidosAnteriores(nuevosEstados)
      setPrimeraCarga(false)
    } catch (error) {
      // Silenciar errores de polling
    }
  }, [pedidosAnteriores, primeraCarga])

  useEffect(() => {
    verificarPedidos()
    const intervalo = setInterval(verificarPedidos, POLLING_INTERVAL)
    return () => clearInterval(intervalo)
  }, [verificarPedidos])

  const eliminarNotificacion = (id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id))
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
