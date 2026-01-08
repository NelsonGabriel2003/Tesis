import { Clock, CheckCircle, ChefHat, Package, XCircle, RefreshCw } from 'lucide-react'
import { getStatusConfig } from '../../models/order/orderModel'

const STEPS = [
  { status: 'pending', label: 'Enviado', icon: Clock },
  { status: 'approved', label: 'Aprobado', icon: CheckCircle },
  { status: 'preparing', label: 'Preparando', icon: ChefHat },
  { status: 'completed', label: 'Listo', icon: Package },
  { status: 'delivered', label: 'Entregado', icon: CheckCircle }
]

const OrderTracking = ({ order, onRefresh, isLoading }) => {
  const statusConfig = getStatusConfig(order.status)
  
  const currentStepIndex = STEPS.findIndex(s => s.status === order.status)
  const isRejected = order.status === 'rejected'
  const isCancelled = order.status === 'cancelled'
  const isCompleted = order.status === 'completed' || order.status === 'delivered'

  const getTimeSince = () => {
    const created = new Date(order.created_at)
    const now = new Date()
    const diffMs = now - created
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Hace un momento'
    if (diffMins < 60) return `Hace ${diffMins} min`
    const diffHours = Math.floor(diffMins / 60)
    return `Hace ${diffHours}h ${diffMins % 60}min`
  }

  if (isRejected || isCancelled) {
    return (
      <div className="p-4">
        <div className={`text-center py-8 px-4 rounded-xl ${isRejected ? 'bg-red-50' : 'bg-gray-100'}`}>
          <XCircle size={48} className={`mx-auto mb-3 ${isRejected ? 'text-red-500' : 'text-gray-500'}`} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Pedido {isRejected ? 'Rechazado' : 'Cancelado'}
          </h3>
          <p className="text-gray-600">#{order.order_code}</p>
          {order.rejection_reason && (
            <p className="mt-3 text-sm text-red-600 bg-red-100 p-3 rounded-lg">
              {order.rejection_reason}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Pedido #{order.order_code}</h2>
          <p className="text-sm text-gray-500">{getTimeSince()}</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className={`text-center py-4 px-6 rounded-xl mb-6 ${statusConfig.bgColor}`}>
        <span className="text-3xl mb-2 block">{statusConfig.icon}</span>
        <p className={`font-bold text-lg ${statusConfig.textColor}`}>
          {statusConfig.label}
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="relative">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            
            return (
              <div key={step.status} className="flex items-center mb-4 last:mb-0">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center z-10
                  ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}
                  ${isCurrent ? 'ring-4 ring-green-200' : ''}
                `}>
                  <StepIcon size={20} />
                </div>
                
                <div className="ml-4 flex-1">
                  <p className={`font-medium ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>

                {index < STEPS.length - 1 && (
                  <div className={`
                    absolute left-5 w-0.5 h-8 -translate-x-1/2
                    ${isActive && index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}
                  `} style={{ top: `${index * 56 + 40}px` }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-green-700 font-semibold">
            🎉 ¡+{order.points_earned || order.points_to_earn} puntos acreditados!
          </p>
        </div>
      )}
    </div>
  )
}

export default OrderTracking