import { useState } from 'react'
import { MapPin, FileText, ArrowLeft, Loader } from 'lucide-react'

const OrderSummary = ({ 
  items, 
  cartTotals, 
  tableNumber,
  notes,
  onTableChange,
  onNotesChange,
  onSubmit, 
  onBack,
  isLoading 
}) => {
  return (
    <div className="p-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-800"
      >
        <ArrowLeft size={20} />
        <span>Volver al carrito</span>
      </button>

      <h2 className="text-lg font-bold text-gray-800 mb-4">Confirmar Pedido</h2>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
          <MapPin size={18} />
          Número de Mesa (opcional)
        </label>
        <input
          type="text"
          value={tableNumber}
          onChange={(e) => onTableChange(e.target.value)}
          placeholder="Ej: 5, Barra, Terraza..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
          <FileText size={18} />
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Instrucciones especiales..."
          rows={3}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold text-gray-800 mb-3">Resumen</h3>
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-600">{item.quantity}x {item.name}</span>
            <span className="text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        
        <div className="flex justify-between text-amber-600 mt-3 pt-3 border-t">
          <span>Puntos a ganar</span>
          <span className="font-semibold">+{cartTotals.totalPoints} pts</span>
        </div>
        
        <div className="flex justify-between text-lg font-bold text-gray-800 mt-2">
          <span>Total</span>
          <span>${cartTotals.total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader size={20} className="animate-spin" />
            Enviando...
          </>
        ) : (
          'Confirmar Pedido'
        )}
      </button>
    </div>
  )
}

export default OrderSummary