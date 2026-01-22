/**
 * MainPage Component
 * Pagina principal despues del login - Mobile First
 * Solo para usuarios regulares - Admin es redirigido a /admin
 *
 * Utiliza el contexto de autenticacion (useAuth) para obtener
 * los datos del usuario y evitar duplicacion de logica.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  LogOut,
  Loader,
  Menu,
  HelpCircle,
  Bell,
  User,
  Settings
} from 'lucide-react'
import { userModules } from '../../config/modulesConfig'
import { useAuth } from '../../hooks/useAuth'
import { photoService } from '../../services/admin/adminServices'

const MainPage = () => {
  // Estados locales del componente
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState([])
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [menuLateralAbierto, setMenuLateralAbierto] = useState(false)
  const [fotos, setFotos] = useState([])
  const [cargandoFotos, setCargandoFotos] = useState(true)

  // Alternar menu lateral
  const alternarMenuLateral = () => {
    setMenuLateralAbierto(!menuLateralAbierto)
  }

  // Hook de navegacion
  const navegarHacia = useNavigate()

  // Obtener datos del usuario desde el contexto de autenticacion
  // Ya no necesitamos useEffect ni fetch manual, el contexto lo maneja
  const {
    usuarioActual,
    cargando,
    esAdministrador,
    cerrarSesion
  } = useAuth()

  // Redirigir admin al panel de administracion
  useEffect(() => {
    if (!cargando && esAdministrador) {
      navegarHacia('/admin')
    }
  }, [cargando, esAdministrador, navegarHacia])

  // Cargar fotos del carrusel
  useEffect(() => {
    const cargarFotos = async () => {
      try {
        setCargandoFotos(true)
        const fotosData = await photoService.getAll()
        setFotos(fotosData)
      } catch (error) {
        console.error('Error cargando fotos:', error)
        setFotos([])
      } finally {
        setCargandoFotos(false)
      }
    }
    cargarFotos()
  }, [])

  // Navegar a un modulo especifico
  const navegarAModulo = (ruta) => {
    navegarHacia(ruta)
  }

  // Manejar cambio en el input de busqueda
  const manejarCambioBusqueda = (evento) => {
    const valor = evento.target.value
    setTextoBusqueda(valor)

    // Mostrar resultados si hay texto
    if (valor.length >= 2) {
      setMostrarResultados(true)
      // TODO: Aqui se llamara a la API para buscar
      // Por ahora usamos datos de ejemplo
      setResultadosBusqueda([
        { id: 1, nombre: 'Pizza Margherita', tipo: 'producto', ruta: '/menu' },
        { id: 2, nombre: 'Cerveza Artesanal', tipo: 'producto', ruta: '/menu' },
        { id: 3, nombre: 'Reserva VIP', tipo: 'servicio', ruta: '/servicios' }
      ].filter(item =>
        item.nombre.toLowerCase().includes(valor.toLowerCase())
      ))
    } else {
      setMostrarResultados(false)
      setResultadosBusqueda([])
    }
  }

  // Seleccionar un resultado de busqueda
  const seleccionarResultado = (resultado) => {
    setTextoBusqueda('')
    setMostrarResultados(false)
    navegarHacia(resultado.ruta)
  }

  // Cerrar resultados al hacer clic fuera
  const cerrarResultados = () => {
    setMostrarResultados(false)
  }

  // Mostrar pantalla de carga mientras se obtienen datos
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-text-secondary">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-secondary">

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 bg-amber-100 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">

          {/* Boton menu hamburguesa */}
          <button
            onClick={alternarMenuLateral}
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primary"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo a la derecha */}
          <img
            src="/images/Logo.svg"
            alt="Logo"
            className="h-10 w-10"
          />
        </div>
      </header>

      {/* ============ MENU LATERAL ============ */}
      {/* Overlay oscuro */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          menuLateralAbierto ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={alternarMenuLateral}
      />

      {/* Panel lateral */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          menuLateralAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera del menu */}
        <div className="bg-primary p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              onClick={alternarMenuLateral}
              className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          {/* Info del usuario */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-white">{usuarioActual?.name || 'Usuario'}</p>
              <p className="text-sm text-white/70">{usuarioActual?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Opciones del menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  navegarHacia('/perfil')
                  alternarMenuLateral()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-primary hover:bg-primary/10 transition-colors"
              >
                <User size={20} className="text-primary" />
                <span>Mi Perfil</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  alternarMenuLateral()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-primary hover:bg-primary/10 transition-colors"
              >
                <Bell size={20} className="text-primary" />
                <span>Notificaciones</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  alternarMenuLateral()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-primary hover:bg-primary/10 transition-colors"
              >
                <Settings size={20} className="text-primary" />
                <span>Configuracion</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  alternarMenuLateral()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-primary hover:bg-primary/10 transition-colors"
              >
                <HelpCircle size={20} className="text-primary" />
                <span>Ayuda</span>
              </button>
            </li>
          </ul>

          {/* Separador */}
          <div className="my-4 border-t border-gray-200" />

          {/* Cerrar sesion */}
          <button
            onClick={() => {
              cerrarSesion()
              alternarMenuLateral()
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesion</span>
          </button>
        </nav>
      </div>

      {/* ============ CONTENIDO PRINCIPAL ============ */}
      <main className="px-4 py-6">

        {/* ==================== VISTA USUARIO ==================== */}
        {/* Saludo y Puntos en linea horizontal */}
            <div className="mb-8 flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Hola{usuarioActual?.name ? `, ${usuarioActual.name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-text-secondary">
                  Estas listo para la fiesta?
                </p>
              </div>
              <div className="rounded-xl bg-primary px-4 py-2 text-white shadow-md">
                <p className="text-xs opacity-80">Puntos</p>
                <p className="text-xl font-bold">
                  {usuarioActual?.points?.current?.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            {/* Barra de busqueda con resultados desplegables */}
            <div className="relative mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos, servicios..."
                  value={textoBusqueda}
                  onChange={manejarCambioBusqueda}
                  onFocus={() => textoBusqueda.length >= 2 && setMostrarResultados(true)}
                  onBlur={() => setTimeout(cerrarResultados, 200)}
                  className="w-full rounded-full border border-white/30 bg-white/10 backdrop-blur-sm py-3 pl-12 pr-4 text-text-primary placeholder-text-muted focus:border-primary focus:bg-white/20 focus:outline-none transition-all"
                />
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
              </div>

              {/* Resultados de busqueda desplegables */}
              {mostrarResultados && resultadosBusqueda.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/20 max-h-60 overflow-y-auto z-50">
                  {resultadosBusqueda.map((resultado) => (
                    <button
                      key={resultado.id}
                      onClick={() => seleccionarResultado(resultado)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left border-b border-gray-100 last:border-b-0"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Search size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{resultado.nombre}</p>
                        <p className="text-xs text-text-muted capitalize">{resultado.tipo}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Mensaje sin resultados */}
              {mostrarResultados && textoBusqueda.length >= 2 && resultadosBusqueda.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/20 p-4 z-50">
                  <p className="text-center text-text-muted">No se encontraron resultados</p>
                </div>
              )}
            </div>

            {/* Modulos en linea horizontal */}
            <div className="flex justify-center gap-4 overflow-x-auto pb-4 mt-2">
              {userModules.map((modulo) => {
                const IconoDelModulo = modulo.icon
                return (
                  <button
                    key={modulo.id}
                    onClick={() => navegarAModulo(modulo.route)}
                    className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-xl ${modulo.color} shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-95`}
                  >
                    <div className="rounded-xl bg-white/20 p-2 text-white">
                      <IconoDelModulo size={20} />
                    </div>
                    <span className="text-xs font-medium text-white whitespace-nowrap">
                      {modulo.name}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* ============ SECCION LO ULTIMO ============ */}
            <div className="mt-10">
              <h2 className="font-formal text-2xl text-text-primary mb-4">
                Lo ultimo que ha pasado?
              </h2>

              {/* Carrusel de fotos */}
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {cargandoFotos ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <Loader className="animate-spin text-primary" size={32} />
                  </div>
                ) : fotos.length > 0 ? (
                  fotos.map((foto) => (
                    <div
                      key={foto.id}
                      className="flex-shrink-0 w-64 snap-start"
                    >
                      <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 shadow-md">
                        <img
                          src={foto.imageUrl}
                          alt={foto.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        {/* Overlay con titulo */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <p className="absolute bottom-3 left-3 right-3 text-white font-grueso text-sm">
                          {foto.title}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center w-full py-8">
                    <p className="text-text-muted">No hay fotos disponibles</p>
                  </div>
                )}
              </div>
            </div>

      </main>

    </div>
  )
}

export default MainPage
