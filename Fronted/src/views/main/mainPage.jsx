/**
 * MainPage Component
 * Página principal después del login - Mobile First
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  X, 
  LogOut, 
  UtensilsCrossed, 
  Wrench, 
  User, 
  Gift,
  ChevronRight
} from 'lucide-react'

const MainPage = () => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // Módulos del sistema
  const modules = [
    {
      id: 'menu',
      name: 'Menú',
      description: 'Ver productos disponibles',
      icon: UtensilsCrossed,
      color: 'bg-orange-500',
      route: '/menu'
    },
    {
      id: 'servicios',
      name: 'Servicios',
      description: 'Servicios disponibles',
      icon: Wrench,
      color: 'bg-blue-500',
      route: '/servicios'
    },
    {
      id: 'perfil',
      name: 'Perfil',
      description: 'Mi información',
      icon: User,
      color: 'bg-green-500',
      route: '/perfil'
    },
    {
      id: 'canje',
      name: 'Canje',
      description: 'Canjear mis puntos',
      icon: Gift,
      color: 'bg-purple-500',
      route: '/canje'
    }
  ]

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // Navegar a módulo
  const handleModuleClick = (route) => {
    navigate(route)
  }

  // Toggle búsqueda
  const toggleSearch = () => {
    setSearchOpen(!searchOpen)
    if (searchOpen) {
      setSearchQuery('')
    }
  }

  // Buscar
  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Buscando:', searchQuery)
    // TODO: Implementar búsqueda
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-primary shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/images/Logo.svg" 
              alt="Logo" 
              className="h-10 w-10"
            />
            <span className="text-lg font-bold text-text-primary">
              Sistema
            </span>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Botón Búsqueda */}
            <button
              onClick={toggleSearch}
              className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primaryClr"
              aria-label="Buscar"
            >
              {searchOpen ? <X size={24} /> : <Search size={24} />}
            </button>

            {/* Botón Logout */}
            <button
              onClick={handleLogout}
              className="rounded-full p-2 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Cerrar sesión"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>

        {/* Barra de búsqueda desplegable */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <form onSubmit={handleSearch} className="px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-input-border bg-surface-secondary py-2 pl-10 pr-4 text-text-primary placeholder-text-muted focus:border-primaryClr focus:outline-none focus:ring-2 focus:ring-primaryClr/20"
              />
              <Search 
                size={20} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" 
              />
            </div>
          </form>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="px-4 py-6">
        
        {/* Saludo */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            ¡Hola! 👋
          </h1>
          <p className="text-text-secondary">
            ¿Qué deseas hacer hoy?
          </p>
        </div>

        {/* Grid de Módulos */}
        <div className="grid grid-cols-2 gap-4">
          {modules.map((module) => {
            const IconComponent = module.icon
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.route)}
                className="group flex flex-col items-center rounded-2xl bg-surface-primary p-6 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-95"
              >
                {/* Icono */}
                <div className={`mb-3 rounded-full ${module.color} p-4 text-white transition-transform group-hover:scale-110`}>
                  <IconComponent size={28} />
                </div>

                {/* Nombre */}
                <h3 className="mb-1 font-semibold text-text-primary">
                  {module.name}
                </h3>

                {/* Descripción */}
                <p className="text-center text-xs text-text-muted">
                  {module.description}
                </p>

                {/* Flecha */}
                <ChevronRight 
                  size={16} 
                  className="mt-2 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" 
                />
              </button>
            )
          })}
        </div>

        {/* Card de Puntos (Preview) */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-primaryClr to-purple-600 p-6 text-black shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Tus puntos</p>
              <p className="text-3xl font-bold">1,250</p>
            </div>
            <Gift size={40} className="opacity-80" />
          </div>
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div 
                className="h-full rounded-full bg-white" 
                style={{ width: '62%' }}
              />
            </div>
            <p className="mt-2 text-xs opacity-80">
              750 puntos más para tu próximo premio
            </p>
          </div>
        </div>

      </main>

      {/* Footer / Bottom Navigation (Opcional para mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-surface-primary px-4 py-2 md:hidden">
        <div className="flex items-center justify-around">
          {modules.slice(0, 4).map((module) => {
            const IconComponent = module.icon
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.route)}
                className="flex flex-col items-center p-2 text-text-muted transition-colors hover:text-primaryClr"
              >
                <IconComponent size={20} />
                <span className="mt-1 text-xs">{module.name}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Espaciado para el bottom nav en mobile */}
      <div className="h-20 md:hidden" />

    </div>
  )
}

export default MainPage