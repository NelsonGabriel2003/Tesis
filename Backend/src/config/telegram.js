module.exports = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  
  orderStatus: {
    PENDING: 'pendiente',
    APPROVED: 'aprovado',
    REJECTED: 'rechazado',
    PREPARING: 'preparando',
    COMPLETED: 'completo',
    DELIVERED: 'entregado',
    CANCELLED: 'cancelado'
  },
  
  statusEmoji: {
    pending: '⏳',
    approved: '✅',
    rejected: '❌',
    preparing: '🍳',
    completed: '🎉',
    delivered: '📦',
    cancelled: '🚫'
  }
}