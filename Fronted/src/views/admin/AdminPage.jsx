/**
 * AdminPage Component
 * Panel principal de administración
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Gift,
  Wrench,
  Users,
  UserCog,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Settings,
  Camera
} from 'lucide-react'

// Importar componentes de administración
import ProductsAdmin from './ProductsAdmin'
import RewardsAdmin from './RewardsAdmin'
import ServicesAdmin from './ServicesAdmin'
import UsersAdmin from './UsersAdmin'
import StaffAdmin from './StaffAdmin'
import ConfigAdmin from './ConfigAdmin'
import PhotosAdmin from './PhotosAdmin'

// Contexto de canjes para el admin
import { CanjesAdminProvider } from '../../contexts/CanjesAdminContext'

const AdminPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  // Obtener tab activo de la URL o usar 'products' por defecto
  const activeTab = searchParams.get('section') || 'products'

  // Cambiar tab y actualizar URL
  const setActiveTab = (tabId) => {
    setSearchParams({ section: tabId })
  }

  // Tabs del admin
  const tabs = [
    { id: 'products', name: 'Productos', icon: UtensilsCrossed },
    { id: 'rewards', name: 'Recompensas', icon: Gift },
    { id: 'services', name: 'Servicios', icon: Wrench },
    { id: 'photos', name: 'Fotos', icon: Camera },
    { id: 'users', name: 'Usuarios', icon: Users },
    { id: 'staff', name: 'Personal', icon: UserCog },
    { id: 'config', name: 'Configuración', icon: Settings },
  ]

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Volver al dashboard
  const handleBack = () => {
    navigate('/main')
  }

  // Renderizar contenido según tab activo
  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsAdmin />
      case 'rewards':
        return <RewardsAdmin />
      case 'services':
        return <ServicesAdmin />
      case 'photos':
        return <PhotosAdmin />
      case 'users':
        return <UsersAdmin />
      case 'staff':
        return <StaffAdmin />
      case 'config':
        return <ConfigAdmin />
      default:
        return <ProductsAdmin />
    }
  }

  return (
    <CanjesAdminProvider>
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-gray-800">Panel Admin</h1>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white shadow-lg
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Admin Panel</h2>
              <p className="text-xs text-gray-500">Sistema de Fidelización</p>
            </div>
          </div>

          {/* Botón Volver */}
          <div className="p-4 border-b">
            <button
              onClick={handleBack}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg
                text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver al Inicio</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>

          {/* Logout (Desktop) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
    </CanjesAdminProvider>
  )
}

export default AdminPage
