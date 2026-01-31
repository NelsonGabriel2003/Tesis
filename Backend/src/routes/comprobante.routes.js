import QRCode from 'qrcode'

/**
 * Obtiene la URL base del API
 */
const getBaseUrl = () => {
  // Primero intenta API_URL (configurada manualmente)
  if (process.env.API_URL) {
    return process.env.API_URL.replace(/\/$/, '') // Remover trailing slash
  }
  
  // Luego Railway
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  }
  
  // Fallback local
  return `http://localhost:${process.env.PORT || 8080}`
}

export const generateOrderQR = async (orderCode, orderId) => {
  // Generar URL pública al comprobante PDF
  const baseUrl = getBaseUrl()
  const comprobanteUrl = `${baseUrl}/api/comprobante/${orderCode}`

  try {
    const qrDataUrl = await QRCode.toDataURL(comprobanteUrl, {
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