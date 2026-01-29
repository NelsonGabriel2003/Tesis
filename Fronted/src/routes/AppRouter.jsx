/**
 * App Router
 * Configuracion de rutas de la aplicacion
 *
 * Este archivo define todas las rutas de la aplicacion y sus protecciones.
 * Utiliza el AuthProvider para manejar el estado de autenticacion global.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage, RegisterPage, RecuperarPassword } from '../views/auth'
import { MainPage } from '../views/main'
import { MenuPage } from '../views/menu'
import { OrderPage } from '../views/order'
import { ServiciosPage } from '../views/servicios'
import { PerfilPage } from '../views/perfil'
import { CanjePage } from '../views/canje'
import { AdminPage } from '../views/admin'
import { AuthProvider } from '../contexts/AuthContext'
import { NotificacionesProvider } from '../contexts/NotificacionesContext'

/**
 * RutaProtegida - Verifica que el usuario este logueado
 * Si no hay token, redirige al login
 */
const RutaProtegida = ({ children }) => {
  const tokenGuardado = localStorage.getItem('token')

  if (!tokenGuardado) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * RutaAdmin - Verifica que el usuario sea administrador
 * Requiere: token valido + rol de admin
 */
const RutaAdmin = ({ children }) => {
  const tokenGuardado = localStorage.getItem('token')
  const usuarioGuardado = JSON.parse(localStorage.getItem('user') || '{}')

  if (!tokenGuardado) {
    return <Navigate to="/login" replace />
  }

  if (usuarioGuardado.role !== 'admin') {
    return <Navigate to="/main" replace />
  }

  return children
}

/**
 * RutaPublica - Solo accesible si NO esta logueado
 * Si ya hay sesion activa, redirige a main
 */
const RutaPublica = ({ children }) => {
  const tokenGuardado = localStorage.getItem('token')

  if (tokenGuardado) {
    return <Navigate to="/main" replace />
  }

  return children
}

/**
 * AppRouter - Componente principal de rutas
 * Estructura: BrowserRouter > AuthProvider > Routes
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificacionesProvider>
        <Routes>
          {/* ============ RUTAS PUBLICAS ============ */}

          {/* Login - Inicio de sesion */}
          <Route
            path="/login"
            element={
              <RutaPublica>
                <LoginPage />
              </RutaPublica>
            }
          />

          {/* Registro - Crear cuenta nueva */}
          <Route
            path="/register"
            element={
              <RutaPublica>
                <RegisterPage />
              </RutaPublica>
            }
          />

          {/* Recuperar contraseña */}
          <Route
            path="/recuperar-password"
            element={
              <RutaPublica>
                <RecuperarPassword />
              </RutaPublica>
            }
          />

          {/* ============ RUTAS PROTEGIDAS (requieren login) ============ */}

          {/* Pagina principal */}
          <Route
            path="/main"
            element={
              <RutaProtegida>
                <MainPage />
              </RutaProtegida>
            }
          />

          {/* Menu de productos */}
          <Route
            path="/menu"
            element={
              <RutaProtegida>
                <MenuPage />
              </RutaProtegida>
            }
          />

          {/* Ordenes */}
          <Route
            path="/order"
            element={
              <RutaProtegida>
                <OrderPage />
              </RutaProtegida>
            }
          />

          {/* Detalle de orden por ID */}
          <Route
            path="/order/:id"
            element={
              <RutaProtegida>
                <OrderPage />
              </RutaProtegida>
            }
          />

          {/* Servicios disponibles */}
          <Route
            path="/servicios"
            element={
              <RutaProtegida>
                <ServiciosPage />
              </RutaProtegida>
            }
          />

          {/* Perfil del usuario */}
          <Route
            path="/perfil"
            element={
              <RutaProtegida>
                <PerfilPage />
              </RutaProtegida>
            }
          />

          {/* Canje de puntos */}
          <Route
            path="/canje"
            element={
              <RutaProtegida>
                <CanjePage />
              </RutaProtegida>
            }
          />

          {/* ============ RUTAS DE ADMINISTRADOR ============ */}

          {/* Panel de administracion */}
          <Route
            path="/admin"
            element={
              <RutaAdmin>
                <AdminPage />
              </RutaAdmin>
            }
          />

          {/* ============ REDIRECCIONES ============ */}

          {/* Redirigir raiz a login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Ruta 404 - Redirige a login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </NotificacionesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRouter
