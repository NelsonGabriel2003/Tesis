/**
 * useAuth - Hook personalizado para autenticacion
 *
 * Este hook facilita el acceso al contexto de autenticacion.
 * En lugar de usar useContext(AuthContext) en cada componente,
 * simplemente importamos useAuth y lo llamamos.
 *
 * Ejemplo de uso:
 *   const { usuarioActual, cerrarSesion, esAdministrador } = useAuth()
 *
 * Retorna:
 *   - usuarioActual: objeto con datos del usuario logueado
 *   - cargando: boolean, true mientras carga datos
 *   - error: string con mensaje de error si falla
 *   - esAdministrador: boolean, true si el usuario es admin
 *   - estaAutenticado: boolean, true si hay usuario logueado
 *   - iniciarSesion: funcion para guardar sesion despues del login
 *   - cerrarSesion: funcion para hacer logout
 *   - cargarUsuario: funcion para recargar datos del usuario
 *   - actualizarUsuario: funcion para actualizar datos parcialmente
 */

import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export const useAuth = () => {
  // Obtener el contexto
  const contexto = useContext(AuthContext)

  // Verificar que el hook se use dentro del AuthProvider
  if (!contexto) {
    throw new Error(
      'useAuth debe utilizarse dentro de un AuthProvider. ' +
      'Asegurate de envolver tu aplicacion con <AuthProvider>.'
    )
  }

  return contexto
}
