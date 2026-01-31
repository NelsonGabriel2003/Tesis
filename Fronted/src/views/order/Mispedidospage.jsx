/**
 * MisPedidosPage Component
 * Muestra el historial de pedidos del usuario
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Clock, CheckCircle, ChefHat, Package, XCircle, Eye } from 'lucide-react'
import { orderServices } from '../../services/order/orderServices'

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  approved: { label: 'Aprobado', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  preparing: { label: 'Preparando', icon: ChefHat, color: 'text-orange-600', bg: 'bg-orange-100' },
  completed: { label: 'Listo', icon: Package, color: 'text-green-600', bg: 'bg-green-100' },
  delivered: { label: 'Entregado', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-200' },
  rejected: { label: 'Rechazado', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100' }
}

const MisPedidosPage = () => {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarPedidos()
  }, [])

  const cargarPedidos = async () => {
    try {
      setCargando(true)
      const response = await orderServices.getMyOrders(50)
      if (response.success) {
        setPedidos(response.data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return ''
    const date = new Date(fecha)
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const verDetalle = (pedidoId) => {
    navigate(`/order/${pedidoId}`)
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-text-secondary">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Mis Pedidos</h1>
        </div>
      </header>

      {/* Contenido */}
      <main className="p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {pedidos.length === 0 ? (
          /* Estado vacío */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <ClipboardList size={48} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              No tienes pedidos aún
            </h2>
            <p className="text-gray-500 mb-6 max-w-xs">
              Cuando realices tu primer pedido, aparecerá aquí para que puedas darle seguimiento.
            </p>
            <button
              onClick={() => navigate('/order')}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Hacer mi primer pedido
            </button>
          </div>
        ) : (
          /* Lista de pedidos */
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const statusConfig = STATUS_CONFIG[pedido.status] || STATUS_CONFIG.pending
              const StatusIcon = statusConfig.icon

              return (
                <div
                  key={pedido.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Encabezado del pedido */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800">
                        #{pedido.order_code}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatearFecha(pedido.created_at)}
                    </p>
                  </div>

                  {/* Detalle del pedido */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {pedido.items?.length || 0} producto(s)
                        </p>
                        <p className="font-bold text-lg text-gray-800">
                          ${parseFloat(pedido.total).toFixed(2)}
                        </p>
                        {pedido.points_earned > 0 && (
                          <p className="text-xs text-green-600">
                            +{pedido.points_earned} puntos ganados
                          </p>
                        )}
                        {pedido.points_to_earn > 0 && pedido.status !== 'completed' && pedido.status !== 'delivered' && (
                          <p className="text-xs text-amber-600">
                            +{pedido.points_to_earn} puntos al completar
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => verDetalle(pedido.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
                      >
                        <Eye size={18} />
                        Ver
                      </button>
                    </div>
                  </div>

                  {/* Mesa y notas */}
                  {(pedido.table_number || pedido.notes) && (
                    <div className="px-4 pb-4 text-sm text-gray-500">
                      {pedido.table_number && (
                        <span className="mr-3">🪑 Mesa {pedido.table_number}</span>
                      )}
                      {pedido.notes && (
                        <span>📝 {pedido.notes}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default MisPedidosPage