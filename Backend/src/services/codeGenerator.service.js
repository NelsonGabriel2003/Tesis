const generateOrderCode = () => {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${year}-${random}`
}

const generateQRData = (orderCode, orderId) => {
  return JSON.stringify({
    type: 'order',
    code: orderCode,
    id: orderId,
    timestamp: Date.now()
  })
}

module.exports = {
  generateOrderCode,
  generateQRData
}