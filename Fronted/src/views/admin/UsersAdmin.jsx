/**
 * UsersAdmin Component
 * Gestión de usuarios del sistema
 */

import { useState, useEffect } from 'react'
import {
  Users,
  Award,
  Mail,
  Loader,
  RefreshCw,
  Eye,
  X,
  Gift,
  CheckCircle,
  Clock
} from 'lucide-react'
import api from '../../services/api'
import { statsService } from '../../services/admin/adminServices'
import SearchBar from '../../components/ui/SearchBar'

const UsersAdmin = () => {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [estadisticas, setEstadisticas] = useState(null)
  
  // Canjes pendientes globales
  const [canjesPendientes, setCanjesPendientes] = useState([])

  // Estado del modal de canjes
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [canjesUsuario, setCanjesUsuario] = useState([])
  const [resumenCanjes, setResumenCanjes] = useState(null)
  const [cargandoCanjes, setCargandoCanjes] = useState(false)
  const [procesandoEntrega, setProcesandoEntrega] = useState(null)
  const [mensajeExito, setMensajeExito] = useState(null)

  // Cargar usuarios y estadísticas
  const cargarDatos = async () => {
    setCargando(true)
    setError(null)
    try {
      const response = await api.get('/stats/users')
      setUsuarios(response.data?.recentUsers || [])
      setEstadisticas({
        total: response.data?.totalUsers || 0,
        porNivel: response.data?.usersByLevel || []
      })
      
      // Cargar canjes pendientes
      try {
        const canjesResponse = await api.get('/rewards/pending')
        setCanjesPendientes(canjesResponse.data || [])
      } catch (err) {
        console.error('Error cargando canjes pendientes:', err)
        setCanjesPendientes([])
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      setError('Error al cargar usuarios')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.email?.toLowerCase().includes(busqueda.toLowerCase())
  )

  // Obtener color del nivel
  const obtenerColorNivel = (nivel) => {
    const colores = {
      'bronce': 'bg-amber-100 text-amber-800',
      'plata': 'bg-gray-100 text-gray-800',
      'oro': 'bg-yellow-100 text-yellow-800',
      'platino': 'bg-purple-100 text-purple-800'
    }
    return colores[nivel?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  // Formatear fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return '-'
    return new Date(fechaString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Abrir modal de canjes
  const abrirModalCanjes = async (usuario) => {
    setUsuarioSeleccionado(usuario)
    setModalAbierto(true)
    setCargandoCanjes(true)
    setMensajeExito(null)

    try {
      const response = await statsService.obtenerCanjesUsuario(usuario.id)
      setCanjesUsuario(response.canjes || [])
      setResumenCanjes(response.resumen || { totalCanjes: 0, puntosCanjeados: 0 })
    } catch (err) {
      console.error('Error cargando canjes:', err)
      setCanjesUsuario([])
      setResumenCanjes({ totalCanjes: 0, puntosCanjeados: 0 })
    } finally {
      setCargandoCanjes(false)
    }
  }

  // Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false)
    setUsuarioSeleccionado(null)
    setCanjesUsuario([])
    setResumenCanjes(null)
    setMensajeExito(null)
  }

  // Entregar canje (marcar como usado)
  const entregarCanje = async (canjeId) => {
    setProcesandoEntrega(canjeId)
    setMensajeExito(null)
    try {
      await api.put(`/redemptions/${canjeId}/use`)

      // Actualizar la lista de canjes del modal
      setCanjesUsuario(canjes =>
        canjes.map(canje =>
          canje.id === canjeId
            ? { ...canje, estado: 'used', fechaUso: new Date().toISOString() }
            : canje
        )
      )

      // Actualizar resumen del modal
      setResumenCanjes(prev => ({
        ...prev,
        canjesUsados: (prev.canjesUsados || 0) + 1
      }))

      setMensajeExito('Canje realizado')
      setTimeout(() => setMensajeExito(null), 3000)

    } catch (err) {
      console.error('Error entregando canje:', err)
      alert('Error al procesar la entrega')
    } finally {
      setProcesandoEntrega(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-500">Gestión de usuarios y validación de canjes</p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <RefreshCw size={20} className={cargando ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Stats Cards de Usuarios */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{estadisticas.total}</p>
                <p className="text-xs text-gray-500">Total Usuarios</p>
              </div>
            </div>
          </div>

          {/* Card Canjes Pendientes */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Gift size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{canjesPendientes.length}</p>
                <p className="text-xs text-gray-500">Canjes Pendientes</p>
              </div>
            </div>
          </div>

          {estadisticas.porNivel?.map((nivel) => (
            <div key={nivel.membership_level} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${obtenerColorNivel(nivel.membership_level)}`}>
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{nivel.total}</p>
                  <p className="text-xs text-gray-500 capitalize">{nivel.membership_level || 'Sin nivel'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <SearchBar
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por nombre o email..."
          resultsCount={usuariosFiltrados.length}
          totalCount={estadisticas?.total || usuarios.length}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {cargando ? (
        <div className="flex items-center justify-center py-12">
          <Loader size={40} className="animate-spin text-purple-600" />
        </div>
      ) : (
        /* Users Table */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puntos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canjes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-medium">
                              {usuario.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{usuario.name}</p>
                            <p className="text-sm text-gray-500">ID: {usuario.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          {usuario.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${obtenerColorNivel(usuario.membership_level)}`}>
                          {usuario.membership_level || 'Bronce'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {usuario.current_points?.toLocaleString() || 0}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => abrirModalCanjes(usuario)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <Eye size={16} />
                          <span className="text-sm font-medium">Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Canjes */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift size={24} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Canjes de {usuarioSeleccionado?.name}
                  </h2>
                  <p className="text-sm text-gray-500">{usuarioSeleccionado?.email}</p>
                </div>
              </div>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Mensaje de éxito */}
            {mensajeExito && (
              <div className="mx-6 mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle size={20} />
                {mensajeExito}
              </div>
            )}

            {/* Resumen */}
            {resumenCanjes && (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-6">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{resumenCanjes.totalCanjes}</p>
                    <p className="text-xs text-gray-500">Total canjes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{resumenCanjes.puntosCanjeados?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500">Puntos canjeados</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Canjes */}
            <div className="p-6 overflow-y-auto max-h-[400px]">
              {cargandoCanjes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader size={32} className="animate-spin text-purple-600" />
                </div>
              ) : canjesUsuario.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Gift size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Este usuario no tiene canjes</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                      <th className="pb-3">Fecha</th>
                      <th className="pb-3">Recompensa</th>
                      <th className="pb-3">Código</th>
                      <th className="pb-3">Estado</th>
                      <th className="pb-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {canjesUsuario.map((canje) => (
                      <tr key={canje.id}>
                        <td className="py-3 text-sm text-gray-600">
                          {formatearFecha(canje.fechaCanje)}
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-gray-800">{canje.recompensa}</p>
                          <p className="text-xs text-gray-500">{canje.puntosGastados} pts</p>
                        </td>
                        <td className="py-3">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {canje.codigo}
                          </code>
                        </td>
                        <td className="py-3">
                          {canje.estado === 'used' ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircle size={16} />
                              Entregado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 text-sm">
                              <Clock size={16} />
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          {canje.estado === 'pending' ? (
                            <button
                              onClick={() => entregarCanje(canje.id)}
                              disabled={procesandoEntrega === canje.id}
                              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {procesandoEntrega === canje.id ? (
                                <Loader size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                              Entregar
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersAdmin