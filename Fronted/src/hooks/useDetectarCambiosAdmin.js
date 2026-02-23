/**
 * useDetectarCambiosAdmin
 * Polling cada 60s al endpoint de notificaciones globales.
 * Por cada notificacion nueva, llama agregarNotificacion() del contexto.
 */

import { useEffect, useRef } from 'react'
import { useNotificaciones } from '../contexts/NotificacionesContext'
import api from '../services/api'

const INTERVALO_POLLING = 60000 // 60 segundos
const STORAGE_KEY = 'ultimaConsultaGlobal'

const useDetectarCambiosAdmin = () => {
  const { agregarNotificacion } = useNotificaciones()
  const idsYaProcesados = useRef(new Set())

  useEffect(() => {
    const consultarNotificaciones = async () => {
      try {
        const since = localStorage.getItem(STORAGE_KEY) || new Date(0).toISOString()
        const respuesta = await api.get(`/notifications/global?since=${encodeURIComponent(since)}`)

        if (respuesta.success && respuesta.data?.length > 0) {
          respuesta.data.forEach(notif => {
            if (!idsYaProcesados.current.has(notif.id)) {
              idsYaProcesados.current.add(notif.id)
              agregarNotificacion({
                tipo: notif.tipo,
                titulo: notif.titulo,
                mensaje: notif.mensaje,
                fecha: notif.fecha_creacion
              })
            }
          })

          // Actualizar marca de tiempo a la mas reciente
          const masReciente = respuesta.data[0].fecha_creacion
          localStorage.setItem(STORAGE_KEY, masReciente)
        }
      } catch (error) {
        // Silenciar errores de polling para no molestar al usuario
      }
    }

    // Primera consulta inmediata
    consultarNotificaciones()

    // Polling cada 60s
    const intervalo = setInterval(consultarNotificaciones, INTERVALO_POLLING)

    return () => clearInterval(intervalo)
  }, [agregarNotificacion])
}

export default useDetectarCambiosAdmin
