export default {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  useWebhook: process.env.TELEGRAM_USE_WEBHOOK === 'true',

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