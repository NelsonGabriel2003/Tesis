/**
 * MainPage Component
 * Pagina principal despues del login - Mobile First
 * Solo para usuarios regulares - Admin es redirigido a /admin
 *
 * Utiliza el contexto de autenticacion (useAuth) para obtener
 * los datos del usuario y evitar duplicacion de logica.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  LogOut,
  Loader,
  Menu,
  HelpCircle,
  User,
  ClipboardList,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { userModules } from '../../config/modulesConfig'
import { useAuth } from '../../hooks/useAuth'
import { photoService } from '../../services/admin/adminServices'
import { TelegramModal, Logo } from '../../components/ui'
import NotificacionesPanel from './NotificacionesPanel'
import useDetectarCambiosAdmin from '../../hooks/useDetectarCambiosAdmin'
import api from '../../services/api'

const MainPage = () => {
  // Estados locales del componente
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState([])
  const [mostrarResultados, setMostrarResultados] = useState(false)
  const [menuLateralAbierto, setMenuLateralAbierto] = useState(false)
  const [fotos, setFotos] = useState([])
  const [cargandoFotos, setCargandoFotos] = useState(true)
  const [mostrarModalTelegram, setMostrarModalTelegram] = useState(false)
  const [brilloActivo, setBrilloActivo] = useState(true)
  const [visorAbierto, setVisorAbierto] = useState(false)
  const [fotoActualIdx, setFotoActualIdx] = useState(0)
  const timerVisorRef = useRef(null)

  // Visor fullscreen de fotos
  const abrirVisor = useCallback((idx) => {
    setFotoActualIdx(idx)
    setVisorAbierto(true)
  }, [])

  const cerrarVisor = useCallback(() => {
    setVisorAbierto(false)
    if (timerVisorRef.current) clearInterval(timerVisorRef.current)
  }, [])

  const fotoSiguiente = useCallback(() => {
    setFotoActualIdx(prev => (prev + 1) % fotos.length)
  }, [fotos.length])

  const fotoAnterior = useCallback(() => {
    setFotoActualIdx(prev => (prev - 1 + fotos.length) % fotos.length)
  }, [fotos.length])

  // Auto-avance cada 12s cuando el visor está abierto
  useEffect(() => {
    if (visorAbierto && fotos.length > 1) {
      timerVisorRef.current = setInterval(fotoSiguiente, 12000)
      return () => clearInterval(timerVisorRef.current)
    }
  }, [visorAbierto, fotoActualIdx, fotos.length, fotoSiguiente])

  // Alternar menu lateral
  const alternarMenuLateral = () => {
    setMenuLateralAbierto(!menuLateralAbierto)
  }

  // Polling de notificaciones admin
  useDetectarCambiosAdmin()

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

  // Redirigir admin al panel de administracion!
  useEffect(() => {
    if (!cargando && esAdministrador) {
      navegarHacia('/admin', { replace: true })
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

  // Mostrar modal de Telegram en primer inicio
  useEffect(() => {
    if (!usuarioActual || cargando) return

    const yaVioModal = localStorage.getItem('telegramModalVisto')
    const tieneTelegram = usuarioActual.telegram_chat_id

    if (!yaVioModal && !tieneTelegram) {
      setMostrarModalTelegram(true)
      localStorage.setItem('telegramModalVisto', 'true')
    }
  }, [usuarioActual, cargando])

  useEffect(() => {
    const ciclo = setInterval(() => {
      setBrilloActivo(true)
      setTimeout(() => setBrilloActivo(false), 5000)
    }, 600000)
    const apagar = setTimeout(() => setBrilloActivo(false), 5000)
    return () => { clearInterval(ciclo); clearTimeout(apagar) }
  }, [])

  const cerrarModalTelegram = () => {
    setMostrarModalTelegram(false)
  }

  // Navegar a un modulo especifico
  const navegarAModulo = (ruta) => {
    navegarHacia(ruta)
  }

  // Manejar cambio en el input de busqueda
  const manejarCambioBusqueda = async (evento) => {
    const valor = evento.target.value
    setTextoBusqueda(valor)

    // Mostrar resultados si hay texto
    if (valor.length >= 2) {
      setMostrarResultados(true)

      try {
        // Llamar a la API de búsqueda global
        const respuesta = await api.search(valor)
        const resultados = respuesta.data.map(item => ({
          id: item.id,
          nombre: item.name,
          tipo: item.type,
          icono: item.icon,
          ruta: item.route
        }))

        setResultadosBusqueda(resultados)
      } catch (error) {
        console.error('Error en búsqueda:', error)
        setResultadosBusqueda([])
      }
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

  // Si es administrador, no renderizar nada (ya se redirige)
  if (esAdministrador) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface-secondary">

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 bg-amber-100 shadow-md overflow-visible">
        <div className="flex h-14 items-center justify-between px-4 overflow-visible">

          {/* Boton menu hamburguesa */}
          <button
            onClick={alternarMenuLateral}
            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primary"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo a la derecha */}
          <Logo variant="icon" imgSize="h-28 w-28" />
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
              <NotificacionesPanel />
            </li>
            <li>
              <button
                onClick={() => {
                  navegarHacia('/mis-pedidos')
                  alternarMenuLateral()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-primary hover:bg-primary/10 transition-colors"
              >
                <ClipboardList size={20} className="text-primary" />
                <span>Mis Pedidos</span>
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

            <div className="mb-8 flex items-center gap-6">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold capitalize">
                  <span className={brilloActivo ? 'bg-gradient-to-r from-primary via-amber-500 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]' : 'text-text-primary'}>
                    {usuarioActual?.name ? usuarioActual.name.split(' ')[0].toLowerCase() : 'Usuario'}
                  </span>
                  {brilloActivo && <Sparkles size={22} className="text-amber-500 animate-pulse" />}
                </h1>
                <p className="text-text-secondary">
                  Tu mejor noche empieza aqui
                </p>
              </div>
              <div className="rounded-xl bg-primary px-4 py-2 text-white shadow-md">
                <p className="text-xs opacity-80">Puntos</p>
                <p className="text-xl font-bold">
                  {usuarioActual?.points?.current?.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            <div className="relative mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos, servicios..."
                  value={textoBusqueda}
                  onChange={manejarCambioBusqueda}
                  onFocus={() => textoBusqueda.length >= 2 && setMostrarResultados(true)}
                  onBlur={() => setTimeout(cerrarResultados, 200)}
                  className="w-full rounded-full border border-slate-300 bg-white py-3 pl-12 pr-4 text-text-primary placeholder-text-muted shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all"
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
                      <div className="p-2 rounded-lg bg-primary/10 text-xl">
                        {resultado.icono}
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
            <div className="flex justify-center gap-4 overflow-x-auto pt-2 pb-4 mt-2">
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
                Lo Ultimo Que Ha Pasado?
              </h2>

              {/* Cards compactas de fotos */}
              <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                {cargandoFotos ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <Loader className="animate-spin text-primary" size={32} />
                  </div>
                ) : fotos.length > 0 ? (
                  fotos.map((foto, idx) => (
                    <button
                      key={foto.id}
                      onClick={() => abrirVisor(idx)}
                      className="flex-shrink-0 w-32 snap-start"
                    >
                      <div className="relative h-44 rounded-2xl overflow-hidden shadow-md active:scale-95 transition-transform">
                        <img
                          src={foto.imageUrl}
                          alt={foto.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <p className="absolute bottom-2 left-2 right-2 text-white font-grueso text-xs line-clamp-2">
                          {foto.title}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex items-center justify-center w-full py-8">
                    <p className="text-text-muted">No hay fotos disponibles</p>
                  </div>
                )}
              </div>
            </div>

      </main>

      {/* Visor fullscreen de fotos */}
      {visorAbierto && fotos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Barra de progreso */}
          <div className="flex gap-1 px-3 pt-3">
            {fotos.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 rounded-full overflow-hidden bg-white/30">
                {idx === fotoActualIdx && (
                  <div className="h-full bg-white rounded-full animate-[progreso_12s_linear]" />
                )}
                {idx < fotoActualIdx && (
                  <div className="h-full bg-white rounded-full w-full" />
                )}
              </div>
            ))}
          </div>

          {/* Boton cerrar */}
          <button
            onClick={cerrarVisor}
            className="absolute top-6 right-4 z-10 p-2 text-white/80 hover:text-white"
          >
            <X size={28} />
          </button>

          {/* Foto en formato 9:16 */}
          <div className="flex-1 flex items-center justify-center relative px-4">
            <div className="relative w-full max-w-sm aspect-[9/16] rounded-xl overflow-hidden">
              <img
                src={fotos[fotoActualIdx]?.imageUrl}
                alt={fotos[fotoActualIdx]?.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Zonas de tap para navegar */}
            {fotos.length > 1 && (
              <>
                <button
                  onClick={fotoAnterior}
                  className="absolute left-0 top-0 w-1/3 h-full"
                  aria-label="Anterior"
                />
                <button
                  onClick={fotoSiguiente}
                  className="absolute right-0 top-0 w-1/3 h-full"
                  aria-label="Siguiente"
                />
              </>
            )}
          </div>

          {/* Info de la foto */}
          <div className="px-4 pb-6 pt-3">
            <p className="text-white font-grueso text-lg">
              {fotos[fotoActualIdx]?.title}
            </p>
            {fotos[fotoActualIdx]?.description && (
              <p className="text-white/60 text-sm mt-1">
                {fotos[fotoActualIdx]?.description}
              </p>
            )}
            <p className="text-white/40 text-xs mt-2">
              {fotoActualIdx + 1} / {fotos.length}
            </p>
          </div>
        </div>
      )}

      {/* Modal de vinculación Telegram */}
      <TelegramModal
        visible={mostrarModalTelegram}
        onCerrar={cerrarModalTelegram}
        puntos={50}
      />

    </div>
  )
}

export default MainPage