/**
 * NotificacionesContext
 * Contexto global para manejar notificaciones en toda la app
 */

import { createContext, useContext, useState, useCallback } from 'react'

const NotificacionesContext = createContext(null)

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

export const NotificacionesProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([])
  const [pedidosNotificados, setPedidosNotificados] = useState(new Set())

  // Agregar notificación de pedido completado
  const agregarNotificacionPedido = useCallback((pedido, esPrimeraCompra = false) => {
    // Evitar duplicados
    if (pedidosNotificados.has(pedido.id)) return

    const nuevaNotificacion = {
      id: Date.now(),
      tipo: 'pedido_completado',
      pedidoId: pedido.id,
      codigo: pedido.order_code,
      mensaje: obtenerMensaje(esPrimeraCompra),
      puntos: pedido.points_earned || pedido.points_to_earn,
      total: pedido.total,
      esPrimeraCompra,
      fecha: new Date()
    }

    setNotificaciones(prev => [nuevaNotificacion, ...prev])
    setPedidosNotificados(prev => new Set([...prev, pedido.id]))
  }, [pedidosNotificados])

  // Agregar notificación genérica
  const agregarNotificacion = useCallback((notificacion) => {
    const nueva = {
      id: Date.now(),
      fecha: new Date(),
      ...notificacion
    }
    setNotificaciones(prev => [nueva, ...prev])
  }, [])

  // Eliminar notificación
  const eliminarNotificacion = useCallback((id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id))
  }, [])

  // Limpiar todas las notificaciones
  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([])
  }, [])

  // Verificar si un pedido ya fue notificado
  const pedidoYaNotificado = useCallback((pedidoId) => {
    return pedidosNotificados.has(pedidoId)
  }, [pedidosNotificados])

  const valor = {
    notificaciones,
    agregarNotificacionPedido,
    agregarNotificacion,
    eliminarNotificacion,
    limpiarNotificaciones,
    pedidoYaNotificado,
    cantidadNotificaciones: notificaciones.length
  }

  return (
    <NotificacionesContext.Provider value={valor}>
      {children}
    </NotificacionesContext.Provider>
  )
}

export const useNotificaciones = () => {
  const context = useContext(NotificacionesContext)
  if (!context) {
    throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider')
  }
  return context
}

export default NotificacionesContext
