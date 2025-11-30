/**
 * CanjeModal Component
 * Modal de confirmación de canje
 */

import { X, Star, Lock, CheckCircle, AlertCircle, Loader, Gift, Copy } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-surface-primary p-6 shadow-xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primaryClr/20 to-purple-500/20 text-4xl">
              {reward.category === 'bebidas' && '🍹'}
              {reward.category === 'comida' && '🍕'}
              {reward.category === 'descuentos' && '💰'}
              {reward.category === 'experiencias' && '⭐'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {reward.name}
              </h2>
              <p className="text-sm text-text-muted capitalize">{reward.category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <X size={24} />
          </button>
        </div>

        {/* Descripción */}
        <p className="mt-4 text-text-secondary">
          {reward.description}
        </p>

        {/* Info de puntos */}
        {!redeemStatus?.success && (
          <div className="mt-6 space-y-3">
            {/* Costo */}
            <div className="flex items-center justify-between rounded-xl bg-primaryClr/10 p-4">
              <div className="flex items-center gap-2">
                <Star size={20} className="text-primaryClr" fill="currentColor" />
                <span className="text-primaryClr">Costo del canje</span>
              </div>
              <span className="text-xl font-bold text-primaryClr">
                {reward.pointsCost.toLocaleString()} pts
              </span>
            </div>

            {/* Tus puntos */}
            <div className="flex items-center justify-between rounded-xl bg-surface-secondary p-4">
              <span className="text-text-secondary">Tus puntos actuales</span>
              <span className="font-bold text-text-primary">
                {userPoints.toLocaleString()} pts
              </span>
            </div>

            {/* Balance resultante o puntos faltantes */}
            {canRedeem ? (
              <div className="flex items-center justify-between rounded-xl bg-green-50 p-4">
                <span className="text-green-700">Saldo después del canje</span>
                <span className="font-bold text-green-700">
                  {newBalance.toLocaleString()} pts
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4">
                <Lock size={20} className="text-red-500" />
                <span className="text-red-600">
                  Te faltan <strong>{pointsNeeded.toLocaleString()}</strong> puntos
                </span>
              </div>
            )}

            {/* Stock */}
            {reward.stock <= 10 && (
              <div className="flex items-center gap-2 rounded-xl bg-orange-50 p-4">
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

        {/* Estado de canje exitoso */}
        {redeemStatus?.success && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-green-50 p-4 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-700">
                ¡Canje Exitoso!
              </h3>
              <p className="mt-1 text-sm text-green-600">
                Tu recompensa está lista para usar
              </p>
            </div>

            {/* Código de canje */}
            <div className="rounded-xl border-2 border-dashed border-primaryClr bg-primaryClr/5 p-4">
              <p className="mb-2 text-center text-sm text-text-muted">
                Tu código de canje
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-xl font-bold tracking-wider text-primaryClr">
                  {redeemStatus.data.redeemCode}
                </code>
                <button
                  onClick={copyCode}
                  className="rounded-lg bg-primaryClr/10 p-2 text-primaryClr transition-colors hover:bg-primaryClr/20"
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-text-muted">
                Muestra este código al personal del bar
              </p>
            </div>

            {/* Nuevo saldo */}
            <div className="flex items-center justify-between rounded-xl bg-surface-secondary p-4">
              <span className="text-text-secondary">Tu nuevo saldo</span>
              <div className="flex items-center gap-1 font-bold text-primaryClr">
                <Star size={16} fill="currentColor" />
                {redeemStatus.data.newBalance.toLocaleString()} pts
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {redeemStatus?.error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-4">
            <AlertCircle size={20} className="text-red-500" />
            <span className="text-red-600">{redeemStatus.error}</span>
          </div>
        )}

        {/* Botones */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-gray-300 py-3 font-semibold text-text-secondary transition-colors hover:bg-surface-secondary"
          >
            {redeemStatus?.success ? 'Cerrar' : 'Cancelar'}
          </button>

          {!redeemStatus?.success && (
            <button
              onClick={() => onRedeem(reward.id)}
              disabled={!canRedeem || reward.stock === 0 || redeemStatus?.loading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 font-semibold text-white transition-colors ${
                canRedeem && reward.stock > 0
                  ? 'bg-primaryClr hover:bg-primaryClr/90'
                  : 'cursor-not-allowed bg-gray-300'
              }`}
            >
              {redeemStatus?.loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Canjeando...
                </>
              ) : (
                <>
                  <Gift size={20} />
                  Canjear
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CanjeModal
