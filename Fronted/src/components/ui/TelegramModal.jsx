/**
 * TelegramModal Component
 * Modal para invitar a vincular Telegram con incentivo de puntos
 */

import { X, Send, Gift } from 'lucide-react'

const TELEGRAM_BOT_URL = import.meta.env.VITE_TELEGRAM_BOT_URL || 'https://t.me/tu_bot'

const TelegramModal = ({ visible, onCerrar, puntos = 50 }) => {
  if (!visible) return null

  const abrirTelegram = () => {
    window.open(TELEGRAM_BOT_URL, '_blank')
    onCerrar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* Botón cerrar */}
        <button
          onClick={onCerrar}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Icono */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
          <Send size={32} className="text-white" />
        </div>

        {/* Título */}
        <h2 className="mb-2 text-center text-xl font-bold text-gray-800">
          Vincula tu Telegram
        </h2>

        {/* Incentivo */}
        <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-amber-100 px-4 py-2">
          <Gift size={18} className="text-amber-600" />
          <span className="font-semibold text-amber-700">
            Gana {puntos} puntos gratis
          </span>
        </div>

        {/* Descripción */}
        <p className="mb-6 text-center text-sm text-gray-600">
          Conecta tu Telegram para recibir notificaciones de pedidos y recuperar tu cuenta más fácil.
        </p>

        {/* Botones */}
        <div className="space-y-3">
          <button
            onClick={abrirTelegram}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send size={20} />
            Abrir Telegram
          </button>

          <button
            onClick={onCerrar}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Ahora no, gracias
          </button>
        </div>
      </div>
    </div>
  )
}

export default TelegramModal
