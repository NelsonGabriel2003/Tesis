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

// Mensajes para pedidos cancelados
const MENSAJES_CANCELADO = [
  'Tu pedido no pudo ser procesado',
  'El pedido fue cancelado',
  'No se pudo completar tu pedido'
]

const obtenerMensaje = (tipo) => {
  let mensajes
  if (tipo === 'primera') mensajes = MENSAJES_PRIMERA_COMPRA
  else if (tipo === 'cancelado') mensajes = MENSAJES_CANCELADO
  else mensajes = MENSAJES_REGULARES

  const indice = Math.floor(Math.random() * mensajes.length)
  return mensajes[indice]
}

// Helpers localStorage
const cargarDeStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch { return fallback }
}

const guardarEnStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export const NotificacionesProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState(() => cargarDeStorage('notificaciones', []))
  const [pedidosNotificados, setPedidosNotificados] = useState(() => new Set(cargarDeStorage('pedidosNotificados', [])))

  // Helpers para actualizar estado + localStorage
  const actualizarNotificaciones = useCallback((updater) => {
    setNotificaciones(prev => {
      const nuevas = typeof updater === 'function' ? updater(prev) : updater
      guardarEnStorage('notificaciones', nuevas)
      return nuevas
    })
  }, [])

  const actualizarPedidosNotificados = useCallback((updater) => {
    setPedidosNotificados(prev => {
      const nuevo = typeof updater === 'function' ? updater(prev) : updater
      guardarEnStorage('pedidosNotificados', [...nuevo])
      return nuevo
    })
  }, [])

  // Agregar notificación de pedido completado
  const agregarNotificacionPedido = useCallback((pedido, esPrimeraCompra = false) => {
    if (pedidosNotificados.has(pedido.id)) return

    const nuevaNotificacion = {
      id: Date.now(),
      tipo: 'pedido_completado',
      pedidoId: pedido.id,
      codigo: pedido.order_code,
      mensaje: obtenerMensaje(esPrimeraCompra ? 'primera' : 'regular'),
      puntos: pedido.points_earned || pedido.points_to_earn,
      total: pedido.total,
      esPrimeraCompra,
      fecha: new Date()
    }

    actualizarNotificaciones(prev => [nuevaNotificacion, ...prev])
    actualizarPedidosNotificados(prev => new Set([...prev, pedido.id]))
  }, [pedidosNotificados, actualizarNotificaciones, actualizarPedidosNotificados])

  // Agregar notificación de pedido cancelado
  const agregarNotificacionCancelado = useCallback((pedido) => {
    const key = `cancelado_${pedido.id}`
    if (pedidosNotificados.has(key)) return

    const nuevaNotificacion = {
      id: Date.now(),
      tipo: 'pedido_cancelado',
      pedidoId: pedido.id,
      codigo: pedido.order_code,
      mensaje: obtenerMensaje('cancelado'),
      motivo: pedido.rejection_reason,
      total: pedido.total,
      fecha: new Date()
    }

    actualizarNotificaciones(prev => [nuevaNotificacion, ...prev])
    actualizarPedidosNotificados(prev => new Set([...prev, key]))
  }, [pedidosNotificados, actualizarNotificaciones, actualizarPedidosNotificados])

  // Agregar notificación genérica
  const agregarNotificacion = useCallback((notificacion) => {
    const nueva = {
      id: Date.now(),
      fecha: new Date(),
      ...notificacion
    }
    actualizarNotificaciones(prev => [nueva, ...prev])
  }, [actualizarNotificaciones])

  // Eliminar notificación
  const eliminarNotificacion = useCallback((id) => {
    actualizarNotificaciones(prev => prev.filter(n => n.id !== id))
  }, [actualizarNotificaciones])

  // Limpiar todas las notificaciones
  const limpiarNotificaciones = useCallback(() => {
    actualizarNotificaciones([])
  }, [actualizarNotificaciones])

  // Verificar si un pedido ya fue notificado
  const pedidoYaNotificado = useCallback((pedidoId) => {
    return pedidosNotificados.has(pedidoId)
  }, [pedidosNotificados])

  const valor = {
    notificaciones,
    agregarNotificacionPedido,
    agregarNotificacionCancelado,
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
