const QRCode = require('qrcode')

const generateOrderQR = async (orderCode, orderId) => {
  const qrData = JSON.stringify({
    type: 'order',
    code: orderCode,
    id: orderId,
    t: Date.now()
  })

  try {
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2
    })
    return qrDataUrl
  } catch (error) {
    console.error('Error generando QR:', error)
    throw new Error('No se pudo generar el código QR')
  }
}

module.exports = {
  generateOrderQR
}