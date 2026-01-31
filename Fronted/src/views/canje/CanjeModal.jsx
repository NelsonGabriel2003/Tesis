/**
 * CanjeModal Component
 * Modal de confirmación de canje
 */

import { X, Star, Lock, CheckCircle, AlertCircle, Loader, Copy, Clock } from 'lucide-react'
import { useState } from 'react'

const CanjeModal = ({
  reward,
  canRedeem,
  userPoints,
  redeemStatus,
  onRedeem,
  onClose
}) => {
  const [copied, setCopied] = useState(false)
  const pointsNeeded = reward.pointsCost - userPoints
  const newBalance = userPoints - reward.pointsCost

  const copyCode = () => {
    if (redeemStatus?.data?.redeemCode) {
      navigator.clipboard.writeText(redeemStatus.data.redeemCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        {/* Imagen de cabecera */}
        <div className="relative h-48 w-full overflow-hidden">
          {reward.imageUrl ? (
            <img
              src={reward.imageUrl}
              alt={reward.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600
              flex items-center justify-center">
              <span className="text-6xl drop-shadow-lg">
                {reward.category?.toLowerCase() === 'bebidas' && '🍹'}
                {reward.category?.toLowerCase() === 'comida' && '🍕'}
                {reward.category?.toLowerCase() === 'descuentos' && '💰'}
                {reward.category?.toLowerCase() === 'experiencias' && '⭐'}
                {!['bebidas', 'comida', 'descuentos', 'experiencias'].includes(reward.category?.toLowerCase()) && '🎁'}
              </span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Botón cerrar sobre imagen */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/30 p-2 text-white
              backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <X size={24} />
          </button>

          {/* Categoría badge */}
          <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1
            text-sm font-medium text-gray-700 backdrop-blur-sm capitalize">
            {reward.category}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Header info */}
          <h2 className="text-2xl font-bold text-gray-800">
            {reward.name}
          </h2>

          {/* Descripción */}
          <p className="mt-2 text-gray-600 leading-relaxed">
            {reward.description}
          </p>

          {/* Info de puntos */}
          {!redeemStatus?.success && (
            <div className="mt-6 space-y-3">
              {/* Costo */}
              <div className="flex items-center justify-between rounded-xl bg-purple-50 p-4">
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-purple-600" fill="currentColor" />
                  <span className="text-purple-700 font-medium">Costo del canje</span>
                </div>
                <span className="text-xl font-bold text-purple-600">
                  {reward.pointsCost.toLocaleString()} pts
                </span>
              </div>

              {/* Tus puntos */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <span className="text-gray-600">Tus puntos actuales</span>
                <span className="font-bold text-gray-800">
                  {userPoints.toLocaleString()} pts
                </span>
              </div>

              {/* Balance resultante o puntos faltantes */}
              {canRedeem ? (
                <div className="flex items-center justify-between rounded-xl bg-green-50 p-4 border border-green-200">
                  <span className="text-green-700">Saldo después del canje</span>
                  <span className="font-bold text-green-700">
                    {newBalance.toLocaleString()} pts
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 border border-red-200">
                  <Lock size={20} className="text-red-500" />
                  <span className="text-red-600">
                    Te faltan <strong>{pointsNeeded.toLocaleString()}</strong> puntos
                  </span>
                </div>
              )}

              {/* Stock */}
              {reward.stock <= 10 && (
                <div className="flex items-center gap-2 rounded-xl bg-orange-50 p-4 border border-orange-200">
                  <AlertCircle size={20} className="text-orange-500" />
                  <span className="text-orange-700">
                    {reward.stock === 0
                      ? 'Esta recompensa está agotada'
                      : `¡Solo quedan ${reward.stock} disponibles!`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Estado de canje - Código generado */}
          {redeemStatus?.success && (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-amber-50 p-6 text-center border border-amber-200">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <Clock size={32} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-amber-700">
                  Código Generado
                </h3>
                <p className="mt-1 text-sm text-amber-600">
                  Muestra este código al personal para validar tu canje
                </p>
              </div>

              {/* Código de canje */}
              <div className="rounded-xl border-2 border-dashed border-purple-400 bg-purple-50 p-4">
                <p className="mb-2 text-center text-sm text-gray-600">
                  Tu código de canje
                </p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-bold tracking-widest text-purple-600">
                    {redeemStatus.data.redeemCode}
                  </code>
                  <button
                    onClick={copyCode}
                    className="rounded-lg bg-purple-100 p-2 text-purple-600 transition-colors hover:bg-purple-200"
                  >
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="mt-2 text-center text-xs text-gray-500">
                  El personal validará este código y te entregará tu recompensa
                </p>
              </div>

              {/* Nuevo saldo */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <span className="text-gray-600">Tu nuevo saldo</span>
                <div className="flex items-center gap-1 font-bold text-purple-600">
                  <Star size={16} fill="currentColor" />
                  {redeemStatus.data.newBalance.toLocaleString()} pts
                </div>
              </div>

              {/* Info adicional */}
              <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
                <p className="text-sm text-blue-700">
                  📱 <strong>Tip:</strong> Guarda una captura de pantalla de este código por si lo necesitas
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {redeemStatus?.error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 border border-red-200">
              <AlertCircle size={20} className="text-red-500" />
              <span className="text-red-600">{redeemStatus.error}</span>
            </div>
          )}

          {/* Botones */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-300 py-3 font-semibold text-gray-600
                transition-colors hover:bg-gray-50"
            >
              {redeemStatus?.success ? 'Cerrar' : 'Cancelar'}
            </button>

            {!redeemStatus?.success && (
              <button
                onClick={() => onRedeem(reward.id)}
                disabled={!canRedeem || reward.stock === 0 || redeemStatus?.loading}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-semibold
                  text-white transition-all duration-200 ${
                  canRedeem && reward.stock > 0
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-500/30'
                    : 'cursor-not-allowed bg-gray-300'
                }`}
              >
                {redeemStatus?.loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Canjeando...
                  </>
                ) : (
                  'Canjear'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CanjeModal