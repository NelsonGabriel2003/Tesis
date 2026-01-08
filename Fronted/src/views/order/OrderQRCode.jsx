import { Download, Share2 } from 'lucide-react'

const OrderQRCode = ({ order }) => {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = order.qrCode
    link.download = `pedido-${order.order_code}.png`
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido #${order.order_code}`,
          text: `Mi pedido está listo. Código: ${order.order_code}`
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    }
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Tu Código QR</h3>
        <p className="text-gray-500 mb-4">Muéstralo al recoger tu pedido</p>
        
        {order.qrCode && (
          <div className="bg-white p-4 rounded-xl inline-block mb-4 border-2 border-gray-100">
            <img 
              src={order.qrCode} 
              alt="Código QR del pedido"
              className="w-48 h-48 mx-auto"
            />
          </div>
        )}
        
        <p className="text-2xl font-mono font-bold text-amber-600 mb-6">
          {order.order_code}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download size={18} />
            Guardar
          </button>
          
          {navigator.share && (
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              <Share2 size={18} />
              Compartir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderQRCode