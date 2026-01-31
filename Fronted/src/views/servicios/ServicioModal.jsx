/**
 * ServicioModal Component
 * Modal de detalle con botón de WhatsApp directo
 */

import { X, MessageCircle } from 'lucide-react'

// Número de WhatsApp de FOODIX (formato internacional)
const WHATSAPP_NUMBER = '593958988509'

const ServicioModal = ({ service, onClose }) => {
  
  // Abrir WhatsApp con mensaje prellenado
  const contactarWhatsApp = () => {
    const mensaje = encodeURIComponent(
      `Hola! 👋 Me interesa el servicio: *${service.name}*\n\nQuisiera más información para reservar.`
    )
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {service.imageUrl ? (
              <img 
                src={service.imageUrl} 
                alt={service.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-4xl">
                {service.icon || '📋'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {service.name}
              </h2>
              <p className="text-sm text-gray-500">{service.category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Descripción */}
        <p className="mt-4 text-gray-600">
          {service.description}
        </p>

        {/* Info adicional */}
        <div className="mt-6 rounded-xl bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            📞 Para reservar este servicio, contáctanos directamente por WhatsApp. 
            Te responderemos lo más pronto posible.
          </p>
        </div>

        {/* Botones */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-gray-300 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cerrar
          </button>

          <button
            onClick={contactarWhatsApp}
            disabled={!service.available}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-semibold text-white transition-colors ${
              service.available
                ? 'bg-green-500 hover:bg-green-600'
                : 'cursor-not-allowed bg-gray-300'
            }`}
          >
            <MessageCircle size={20} />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServicioModal