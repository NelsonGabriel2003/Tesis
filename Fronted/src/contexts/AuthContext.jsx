/**
 * AuthContext - Contexto de Autenticacion
 *
 * Este contexto maneja el estado global del usuario autenticado.
 * Permite compartir la informacion del usuario en toda la aplicacion
 * sin necesidad de pasar props manualmente (evita prop drilling).
 *
 * Funcionalidades:
 * - Cargar datos del usuario desde localStorage y API
 * - Iniciar sesion (guardar token y datos)
 * - Cerrar sesion (limpiar datos y redirigir)
 * - Verificar si el usuario es administrador
 * - Actualizar datos del usuario
 */

import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { perfilService } from '../services/perfil/perfilServices'

// Crear el contexto con valor inicial null
export const AuthContext = createContext(null)

/**
 * AuthProvider - Componente proveedor del contexto
 * Envuelve la aplicacion y provee el estado de autenticacion
 */
export const AuthProvider = ({ children }) => {
  // Estado del usuario actual
  const [usuarioActual, setUsuarioActual] = useState(null)

  // Estado de carga (true mientras se obtienen datos)
  const [cargando, setCargando] = useState(true)

  // Estado de error (mensaje si algo falla)
  const [error, setError] = useState(null)

  // Hook para navegacion
  const navegarHacia = useNavigate()

  // Verificar si el usuario tiene rol de administrador
  const esAdministrador = usuarioActual?.role === 'admin'

  // Verificar si hay un usuario autenticado
  const estaAutenticado = !!usuarioActual

  /**
   * cargarUsuario - Obtiene los datos del usuario
   * 1. Primero carga desde localStorage (rapido)
   * 2. Luego actualiza desde la API (datos frescos)
   */
  const cargarUsuario = useCallback(async () => {
    setCargando(true)
    setError(null)

    try {
      // Verificar si existe un token guardado
      const tokenGuardado = localStorage.getItem('token')

      if (!tokenGuardado) {
        // No hay token, usuario no autenticado
        setUsuarioActual(null)
        setCargando(false)
        return
      }

      // Cargar datos guardados en localStorage (carga rapida)
      const usuarioGuardado = localStorage.getItem('user')
      if (usuarioGuardado) {
        setUsuarioActual(JSON.parse(usuarioGuardado))
      }

      // Obtener datos actualizados desde la API
      const datosDeAPI = await perfilService.getUserProfile()

      // Combinar datos guardados con datos nuevos de la API
      const usuarioActualizado = {
        ...JSON.parse(usuarioGuardado || '{}'),
        ...datosDeAPI,
        points: datosDeAPI.points,
        membershipLevel: datosDeAPI.membership?.level || 'bronce'
      }

      // Actualizar estado y localStorage
      setUsuarioActual(usuarioActualizado)
      localStorage.setItem('user', JSON.stringify(usuarioActualizado))

    } catch (err) {
      console.error('Error al cargar usuario:', err)
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [])

  /**
   * iniciarSesion - Guarda el token y datos del usuario
   * Se llama despues de un login exitoso
   */
  const iniciarSesion = useCallback(async (token, datosUsuario) => {
    // Guardar en localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(datosUsuario))

    // Actualizar estado
    setUsuarioActual(datosUsuario)

    // Cargar datos completos desde API
    await cargarUsuario()
  }, [cargarUsuario])

  /**
   * cerrarSesion - Limpia todos los datos y redirige al login
   */
  const cerrarSesion = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Limpiar estado
    setUsuarioActual(null)

    // Redirigir a login
    navegarHacia('/login')
  }, [navegarHacia])

  /**
   * actualizarUsuario - Actualiza parcialmente los datos del usuario
   * Util cuando se edita el perfil
   */
  const actualizarUsuario = useCallback((nuevosDatos) => {
    setUsuarioActual(usuarioAnterior => {
      const usuarioActualizado = { ...usuarioAnterior, ...nuevosDatos }
      localStorage.setItem('user', JSON.stringify(usuarioActualizado))
      return usuarioActualizado
    })
  }, [])

  // Cargar usuario cuando el componente se monta
  useEffect(() => {
    cargarUsuario()
  }, [cargarUsuario])

  // Objeto con todos los valores y funciones que se comparten
  const valoresDelContexto = {
    // Estados
    usuarioActual,
    cargando,
    error,
    esAdministrador,
    estaAutenticado,

    // Funciones/Acciones
    iniciarSesion,
    cerrarSesion,
    cargarUsuario,
    actualizarUsuario
  }

  return (
    <AuthContext.Provider value={valoresDelContexto}>
      {children}
    </AuthContext.Provider>
  )
}
