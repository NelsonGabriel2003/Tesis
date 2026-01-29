import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useOrderController } from '../../controllers/order/useOrderController'
import OrderCart from './OrderCart'
import OrderSummary from './OrderSummary'
import OrderTracking from './OrderTracking'
import OrderQRCode from './OrderQRCode'

const VIEWS = { CART: 'cart', SUMMARY: 'summary', TRACKING: 'tracking' }

const OrderPage = () => {
  const { id: orderId } = useParams()
  const navigate = useNavigate()
  const [currentView, setCurrentView] = useState(VIEWS.CART)
  
  const {
    cart, cartTotals, activeOrders, currentOrder, isLoading, error,
    updateQuantity, removeFromCart, setTableNumber, setNotes,
    submitOrder, fetchActiveOrders, fetchOrderById, setError
  } = useOrderController()

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId)
      setCurrentView(VIEWS.TRACKING)
    } else {
      fetchActiveOrders()
    }
  }, [orderId, fetchOrderById, fetchActiveOrders])

  const handleSubmitOrder = async () => {
    const order = await submitOrder()
    if (order) {
      setCurrentView(VIEWS.TRACKING)
    }
  }

  const handleRefresh = async () => {
    if (currentOrder) {
      await fetchOrderById(currentOrder.id)
    }
  }

  const goBack = () => {
    if (currentView === VIEWS.SUMMARY) {
      setCurrentView(VIEWS.CART)
    } else if (currentView === VIEWS.TRACKING && !orderId) {
      setCurrentView(VIEWS.CART)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="rounded-full p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">
            {currentView === VIEWS.CART && 'Mi Pedido'}
            {currentView === VIEWS.SUMMARY && 'Confirmar'}
            {currentView === VIEWS.TRACKING && 'Seguimiento'}
          </h1>
        </div>
      </header>

      {activeOrders.length > 0 && currentView === VIEWS.CART && (
        <div className="bg-amber-100 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-amber-600" />
            <span className="text-amber-800 font-medium">
              Tienes {activeOrders.length} pedido(s) activo(s)
            </span>
          </div>
          <button
            onClick={() => {
              fetchOrderById(activeOrders[0].id)
              setCurrentView(VIEWS.TRACKING)
            }}
            className="text-amber-600 font-semibold hover:underline"
          >
            Ver →
          </button>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-100 text-red-700 rounded-xl">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button>
        </div>
      )}

      <main>
        {currentView === VIEWS.CART && (
          <OrderCart
            items={cart.items}
            cartTotals={cartTotals}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onContinue={() => setCurrentView(VIEWS.SUMMARY)}
          />
        )}

        {currentView === VIEWS.SUMMARY && (
          <OrderSummary
            items={cart.items}
            cartTotals={cartTotals}
            numeroMesa={cart.tableNumber}
            notas={cart.notes}
            alCambiarMesa={setTableNumber}
            alCambiarNotas={setNotes}
            alEnviar={handleSubmitOrder}
            alVolver={() => setCurrentView(VIEWS.CART)}
            estaCargando={isLoading}
          />
        )}

        {currentView === VIEWS.TRACKING && currentOrder && (
          <>
            <OrderTracking
              order={currentOrder}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
            {(currentOrder.status === 'completed' || currentOrder.status === 'approved' || currentOrder.status === 'preparing') && (
              <OrderQRCode order={currentOrder} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default OrderPage