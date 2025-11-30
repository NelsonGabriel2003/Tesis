/**
 * App Router
 * Configuración de rutas de la aplicación
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage, RegisterPage } from '../views/auth'
import { MainPage } from '../views/main'
import { MenuPage } from '../views/menu'
import { ServiciosPage } from '../views/servicios'
import { PerfilPage } from '../views/perfil'
import { CanjePage } from '../views/canje'
import { AdminPage } from '../views/admin'

/**
 * ProtectedRoute - Verifica que el usuario esté logueado
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * AdminRoute - Verifica que el usuario sea administrador
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/main" replace />
  }

  return children
}

/**
 * PublicRoute - Redirige a main si ya está logueado
 */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  if (token) {
    return <Navigate to="/main" replace />
  }

  return children
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública - Login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Ruta pública - Registro */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Rutas protegidas - Requieren login */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <MenuPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/servicios"
          element={
            <ProtectedRoute>
              <ServiciosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <PerfilPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/canje"
          element={
            <ProtectedRoute>
              <CanjePage />
            </ProtectedRoute>
          }
        />

        {/* Ruta Admin - Requiere login + rol admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* Redirigir raíz a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Ruta 404 - Redirige a login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
