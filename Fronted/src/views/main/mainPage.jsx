/**
 * MainPage Component
 * Página principal después del login - Mobile First
 * Muestra contenido diferente para Admin vs Usuario
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  X, 
  LogOut, 
  UtensilsCrossed, 
  Wrench, 
  User, 
  Gift,
  ChevronRight,
  Settings,
  SquareStar,
  Users,
  TrendingUp,
  Package,
  Award,
  Loader,
  RefreshCw
} from 'lucide-react'
import { useDashboardController } from '../../controllers/admin/useDashboardController'

const MainPage = () => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Controlador del dashboard (solo se usa si es admin)
  const { stats, loading: statsLoading, error: statsError, refresh } = useDashboardController()

  // Cargar datos del usuario al montar
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Verificar si es admin
  const isAdmin = user?.role === 'admin'

  // Módulos para USUARIOS
  const userModules = [
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
      icon: SquareStar,
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

  // Módulos para ADMIN
  const adminModules = [
    {
      id: 'products',
      name: 'Productos',
      description: 'Gestionar menú',
      icon: Package,
      color: 'bg-orange-500',
      route: '/admin?section=products'
    },
    {
      id: 'rewards',
      name: 'Recompensas',
      description: 'Gestionar canjes',
      icon: Gift,
      color: 'bg-purple-500',
      route: '/admin?section=rewards'
    },
    {
      id: 'services',
      name: 'Servicios',
      description: 'Gestionar servicios',
      icon: SquareStar,
      color: 'bg-blue-500',
      route: '/admin?section=services'
    },
    {
      id: 'users',
      name: 'Usuarios',
      description: 'Ver clientes',
      icon: Users,
      color: 'bg-green-500',
      route: '/admin?section=users'
    }
  ]

  const modules = isAdmin ? adminModules : userModules

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
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-amber-100 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/images/Logo.svg" 
              alt="Logo" 
              className="h-10 w-10"
            />
            <span className="text-lg font-bold text-text-primary">
              {isAdmin ? 'Admin' : 'Sistema'}
            </span>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Botón Refrescar (solo admin) */}
            {isAdmin && (
              <button
                onClick={refresh}
                disabled={statsLoading}
                className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primaryClr disabled:opacity-50"
                aria-label="Refrescar"
              >
                <RefreshCw size={24} className={statsLoading ? 'animate-spin' : ''} />
              </button>
            )}

            {/* Botón Búsqueda (solo usuarios) */}
            {!isAdmin && (
              <button
                onClick={toggleSearch}
                className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primaryClr"
                aria-label="Buscar"
              >
                {searchOpen ? <X size={24} /> : <Search size={24} />}
              </button>
            )}

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

        {/* Barra de búsqueda desplegable (solo usuarios) */}
        {!isAdmin && (
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
        )}
      </header>

      {/* Contenido Principal */}
      <main className="px-4 py-6">
        
        {/* ==================== VISTA ADMIN ==================== */}
        {isAdmin ? (
          <>
            {/* Saludo Admin */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary">
                Panel de Control 🛡️
              </h1>
              <p className="text-text-secondary">
                Bienvenido, {user?.name || 'Administrador'}
              </p>
            </div>

            {/* Error de estadísticas */}
            {statsError && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {statsError}
              </div>
            )}

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    {statsLoading ? (
                      <Loader size={20} className="animate-spin text-gray-400" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-gray-800">
                          {stats?.totalUsers ?? 0}
                        </p>
                        <p className="text-xs text-gray-500">Usuarios</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Package size={20} className="text-orange-600" />
                  </div>
                  <div>
                    {statsLoading ? (
                      <Loader size={20} className="animate-spin text-gray-400" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-gray-800">
                          {stats?.totalProducts ?? 0}
                        </p>
                        <p className="text-xs text-gray-500">Productos</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award size={20} className="text-purple-600" />
                  </div>
                  <div>
                    {statsLoading ? (
                      <Loader size={20} className="animate-spin text-gray-400" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-gray-800">
                          {stats?.totalRedemptions ?? 0}
                        </p>
                        <p className="text-xs text-gray-500">Canjes</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp size={20} className="text-green-600" />
                  </div>
                  <div>
                    {statsLoading ? (
                      <Loader size={20} className="animate-spin text-gray-400" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-gray-800">
                          {stats?.pointsIssued?.toLocaleString() ?? 0}
                        </p>
                        <p className="text-xs text-gray-500">Puntos emitidos</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Banner ir a Admin */}
            <button
              onClick={() => navigate('/admin')}
              className="w-full mb-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg
                flex items-center justify-between text-white hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Settings size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold">Gestionar Sistema</p>
                  <p className="text-sm opacity-80">Productos, recompensas, servicios</p>
                </div>
              </div>
              <ChevronRight size={24} />
            </button>

            {/* Accesos rápidos Admin */}
            <h2 className="text-lg font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
          </>
        ) : (
          <>
            {/* ==================== VISTA USUARIO ==================== */}
            {/* Saludo Usuario */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary">
                ¡Hola{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
              </h1>
              <p className="text-text-secondary">
                ¿Qué deseas hacer hoy?
              </p>
            </div>
          </>
        )}

        {/* Grid de Módulos (ambos roles) */}
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

        {/* Card de Puntos (SOLO USUARIOS) */}
        {!isAdmin && (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-primaryClr to-purple-600 p-6 text-black shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Tus puntos</p>
                <p className="text-3xl font-bold">
                  {user?.points?.current?.toLocaleString() || '0'}
                </p>
              </div>
              <Gift size={40} className="opacity-80" />
            </div>
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div 
                  className="h-full rounded-full bg-white" 
                  style={{ 
                    width: `${Math.min(100, ((user?.points?.total || 0) / 5000) * 100)}%` 
                  }}
                />
              </div>
              <p className="mt-2 text-xs opacity-80">
                Nivel: {user?.membershipLevel || 'Bronce'} • {user?.points?.total?.toLocaleString() || 0} puntos totales
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Footer / Bottom Navigation (SOLO USUARIOS) */}
      {!isAdmin && (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-blue-100 bg-blue-50 px-4 py-2 md:hidden">
          <div className="flex items-center justify-around">
            {userModules.slice(0, 4).map((module) => {
              const IconComponent = module.icon
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module.route)}
                  className="flex flex-col items-center p-2 text-text-muted transition-colors hover:text-primaryClr"
                >
                  <IconComponent size={22} />
                  <span className="mt-1 text-xs">{module.name}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      {/* Espaciado para el bottom nav en mobile (SOLO USUARIOS) */}
      {!isAdmin && <div className="h-20 md:hidden" />}

    </div>
  )
}

export default MainPage