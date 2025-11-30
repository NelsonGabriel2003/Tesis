/**
 * App Router
 * Configuración de rutas de la aplicación
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '../views/auth'
import { MainPage } from '../views/main'
import { MenuPage } from '../views/menu'
import { ServiciosPage } from '../views/servicios'
import { PerfilPage } from '../views/perfil'
import { CanjePage } from '../views/canje'

// Puedes dejar ProtectedRoute ahí para más adelante, pero NO lo usaremos aún
/*
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
*/

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/main"
          element={<MainPage />}
        />

        {/* Módulos del sistema de puntos */}
        <Route
          path="/menu"
          element={<MenuPage />}
        />

        <Route
          path="/servicios"
          element={<ServiciosPage />}
        />

        <Route
          path="/perfil"
          element={<PerfilPage />}
        />

        <Route
          path="/canje"
          element={<CanjePage />}
        />

        {/* Redirigir raíz a main mientras pruebas */}
        <Route path="/" element={<Navigate to="/main" replace />} />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/main" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
