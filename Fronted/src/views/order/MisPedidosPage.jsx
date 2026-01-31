/**
 * MisPedidosPage Component
 * Muestra el historial de pedidos del usuario
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Eye } from 'lucide-react'
import { orderServices } from '../../services/order/orderServices'
import { getStatusConfig } from '../../models/order/orderModel'
import { Alert, Button } from '../../components/ui'

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
    return new Date(fecha).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <header className="sticky top-0 z-50  from-amber-400 to-orange-400 px-4 py-4 shadow-md">
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
        <Alert type="error" message={error} />

        {pedidos.length === 0 ? (
          <EstadoVacio onNuevoPedido={() => navigate('/menu')} />
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <PedidoCard 
                key={pedido.id} 
                pedido={pedido} 
                formatearFecha={formatearFecha}
                onVerDetalle={() => navigate(`/order/${pedido.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

/**
 * Componente para estado vacío
 */
const EstadoVacio = ({ onNuevoPedido }) => (
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
    <Button variante="primary" onClick={onNuevoPedido}>
      Hacer mi primer pedido
    </Button>
  </div>
)

/**
 * Componente Card para cada pedido
 */
const PedidoCard = ({ pedido, formatearFecha, onVerDetalle }) => {
  const statusConfig = getStatusConfig(pedido.status)

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Encabezado */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-gray-800">
            #{pedido.order_code}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
            <span>{statusConfig.icon}</span>
            {statusConfig.label}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {formatearFecha(pedido.created_at)}
        </p>
      </div>

      {/* Detalle */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {pedido.items?.length || 0} producto(s)
            </p>
            <p className="font-bold text-lg text-gray-800">
              ${parseFloat(pedido.total).toFixed(2)}
            </p>
            <PuntosInfo pedido={pedido} />
          </div>
          <button
            onClick={onVerDetalle}
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
}

/**
 * Componente para mostrar información de puntos
 */
const PuntosInfo = ({ pedido }) => {
  const isCompleted = pedido.status === 'completed' || pedido.status === 'delivered'
  
  if (pedido.points_earned > 0) {
    return (
      <p className="text-xs text-green-600">
        +{pedido.points_earned} puntos ganados
      </p>
    )
  }
  
  if (pedido.points_to_earn > 0 && !isCompleted) {
    return (
      <p className="text-xs text-amber-600">
        +{pedido.points_to_earn} puntos al completar
      </p>
    )
  }
  
  return null
}

export default MisPedidosPage