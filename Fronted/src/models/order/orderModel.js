export const ORDER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PREPARING: 'preparing',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pendiente', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: '⏳' },
  approved: { label: 'Aprobado', bgColor: 'bg-blue-100', textColor: 'text-blue-700', icon: '✅' },
  preparing: { label: 'Preparando', bgColor: 'bg-orange-100', textColor: 'text-orange-700', icon: '🍳' },
  completed: { label: 'Listo', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: '🎉' },
  delivered: { label: 'Entregado', bgColor: 'bg-green-200', textColor: 'text-green-800', icon: '📦' },
  rejected: { label: 'Rechazado', bgColor: 'bg-red-100', textColor: 'text-red-700', icon: '❌' },
  cancelled: { label: 'Cancelado', bgColor: 'bg-gray-200', textColor: 'text-gray-700', icon: '🚫' }
}

export const getStatusConfig = (status) => {
  return ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending
}

export const calculateCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalPoints = items.reduce((sum, item) => sum + (item.pointsEarned * item.quantity), 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  
  return { subtotal, total: subtotal, totalPoints, itemCount }
}