import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'

const OrderCart = ({ 
  items, 
  cartTotals, 
  onUpdateQuantity, 
  onRemoveItem, 
  onContinue 
}) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart size={40} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Tu carrito está vacío</h3>
        <p className="text-gray-500 text-center">Agrega productos desde el menú para hacer un pedido</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Tu Pedido</h2>
      
      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.productId}
            className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
          >
            {item.image && (
              <img 
                src={item.image} 
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500">${item.price.toFixed(2)} c/u</p>
              <p className="text-xs text-amber-600">+{item.pointsEarned} pts c/u</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <Minus size={16} />
              </button>
              
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              
              <button
                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                disabled={item.quantity >= 10}
              >
                <Plus size={16} />
              </button>

              <button
                onClick={() => onRemoveItem(item.productId)}
                className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 ml-2"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between text-gray-600 mb-2">
          <span>Subtotal ({cartTotals.itemCount} items)</span>
          <span>${cartTotals.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-amber-600 mb-3">
          <span>Puntos a ganar</span>
          <span>+{cartTotals.totalPoints} pts</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t">
          <span>Total</span>
          <span>${cartTotals.total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full mt-4 bg-amber-500 text-white py-4 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
      >
        Continuar
      </button>
    </div>
  )
}

export default OrderCart