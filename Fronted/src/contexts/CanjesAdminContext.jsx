/**
 * CanjesAdminContext
 * Contexto global para manejar canjes en el panel de administracion
 * Incluye polling y persistencia de estado
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { statsService } from '../services/admin/adminServices'
import { useAuth } from '../hooks/useAuth'

const CanjesAdminContext = createContext(null)

// Intervalo de polling en milisegundos (10 segundos)
const POLLING_INTERVAL = 10000

export const CanjesAdminProvider = ({ children }) => {
  const { esAdministrador } = useAuth()

  // Estado de canjes
  const [canjes, setCanjes] = useState([])
  const [resumen, setResumen] = useState({
    total: 0,
    pendientes: 0,
    usados: 0,
    puntosTotales: 0
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)

  // Para detectar nuevos canjes
  const [canjesNuevos, setCanjesNuevos] = useState([])
  const canjesAnterioresRef = useRef(new Set())

  // Referencia para el intervalo
  const pollingRef = useRef(null)

  // Cargar canjes desde el servidor
  const cargarCanjes = useCallback(async (mostrarCarga = false) => {
    if (!esAdministrador) return

    if (mostrarCarga) setCargando(true)
    setError(null)

    try {
      const response = await statsService.obtenerTodosCanjes(null, 100)

      if (response.exito) {
        const nuevosCanjes = response.canjes || []

        // Detectar canjes nuevos (que no estaban antes)
        const idsActuales = new Set(nuevosCanjes.map(c => c.id))
        const nuevosIds = nuevosCanjes
          .filter(c => !canjesAnterioresRef.current.has(c.id))
          .map(c => c.id)

        // Solo marcar como nuevos si no es la primera carga
        if (canjesAnterioresRef.current.size > 0 && nuevosIds.length > 0) {
          setCanjesNuevos(prev => [...new Set([...prev, ...nuevosIds])])
        }

        // Actualizar referencia
        canjesAnterioresRef.current = idsActuales

        setCanjes(nuevosCanjes)
        setResumen(response.resumen || {
          total: 0,
          pendientes: 0,
          usados: 0,
          puntosTotales: 0
        })
        setUltimaActualizacion(new Date(response.timestamp))
      }
    } catch (err) {
      console.error('Error cargando canjes:', err)
      setError('Error al cargar canjes')
    } finally {
      if (mostrarCarga) setCargando(false)
    }
  }, [esAdministrador])

  // Marcar canje como visto (quitar de nuevos)
  const marcarCanjeVisto = useCallback((canjeId) => {
    setCanjesNuevos(prev => prev.filter(id => id !== canjeId))
  }, [])

  // Marcar todos como vistos
  const marcarTodosVistos = useCallback(() => {
    setCanjesNuevos([])
  }, [])

  // Entregar canje (marcar como usado)
  const entregarCanje = useCallback(async (canjeId) => {
    try {
      const response = await statsService.entregarCanje(canjeId)

      if (response.exito) {
        // Actualizar estado local inmediatamente
        setCanjes(prev => prev.map(canje =>
          canje.id === canjeId
            ? { ...canje, estado: 'used', fechaUso: new Date().toISOString() }
            : canje
        ))

        // Actualizar resumen
        setResumen(prev => ({
          ...prev,
          pendientes: Math.max(0, prev.pendientes - 1),
          usados: prev.usados + 1
        }))

        // Quitar de nuevos si estaba
        marcarCanjeVisto(canjeId)

        return { exito: true }
      }

      return { exito: false, mensaje: response.mensaje }
    } catch (err) {
      console.error('Error entregando canje:', err)
      return { exito: false, mensaje: 'Error al procesar entrega' }
    }
  }, [marcarCanjeVisto])

  // Iniciar polling
  const iniciarPolling = useCallback(() => {
    if (pollingRef.current) return // Ya hay polling activo

    pollingRef.current = setInterval(() => {
      cargarCanjes(false) // Sin mostrar loading
    }, POLLING_INTERVAL)
  }, [cargarCanjes])

  // Detener polling
  const detenerPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  // Refrescar manualmente
  const refrescar = useCallback(() => {
    cargarCanjes(true)
  }, [cargarCanjes])

  // Efecto para cargar datos iniciales y polling si es admin
  useEffect(() => {
    if (esAdministrador) {
      cargarCanjes(true)
      iniciarPolling()
    }

    return () => {
      detenerPolling()
    }
  }, [esAdministrador, cargarCanjes, iniciarPolling, detenerPolling])

  // Verificar si un canje es nuevo
  const esCanjeNuevo = useCallback((canjeId) => {
    return canjesNuevos.includes(canjeId)
  }, [canjesNuevos])

  // Obtener canjes pendientes
  const canjesPendientes = canjes.filter(c => c.estado === 'pending')

  // Obtener canjes usados
  const canjesUsados = canjes.filter(c => c.estado === 'used')

  const valor = {
    // Datos
    canjes,
    canjesPendientes,
    canjesUsados,
    resumen,
    cargando,
    error,
    ultimaActualizacion,

    // Nuevos canjes
    canjesNuevos,
    cantidadNuevos: canjesNuevos.length,
    esCanjeNuevo,
    marcarCanjeVisto,
    marcarTodosVistos,

    // Acciones
    cargarCanjes,
    entregarCanje,
    refrescar,
    iniciarPolling,
    detenerPolling
  }

  return (
    <CanjesAdminContext.Provider value={valor}>
      {children}
    </CanjesAdminContext.Provider>
  )
}

export const useCanjesAdmin = () => {
  const context = useContext(CanjesAdminContext)
  if (!context) {
    throw new Error('useCanjesAdmin debe usarse dentro de CanjesAdminProvider')
  }
  return context
}

export default CanjesAdminContext
