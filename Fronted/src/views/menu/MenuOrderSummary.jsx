/**
 * MenuOrderSummary Component
 * Resumen del pedido flotante
 */

import { ShoppingCart, Star, Trash2 } from 'lucide-react'

const MenuOrderSummary = ({ orderItems, orderTotal, orderPoints, onClearOrder }) => {
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-surface-primary p-4 shadow-lg">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          {/* Info del pedido */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primaryClr text-white">
                <ShoppingCart size={24} />
              </div>
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {totalItems}
              </span>
            </div>

            <div>
              <p className="text-sm text-text-muted">Total del pedido</p>
              <p className="text-xl font-bold text-text-primary">
                ${orderTotal.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Puntos a ganar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
              <Star size={16} fill="currentColor" />
              +{orderPoints} pts
            </div>

            <button
              onClick={onClearOrder}
              className="rounded-full p-2 text-red-500 transition-colors hover:bg-red-50"
              title="Limpiar pedido"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Botón de confirmar */}
        <button className="mt-3 w-full rounded-full bg-primaryClr py-3 font-semibold text-white transition-colors hover:bg-primaryClr/90">
          Confirmar Pedido
        </button>
      </div>
    </div>
  )
}

export default MenuOrderSummary
