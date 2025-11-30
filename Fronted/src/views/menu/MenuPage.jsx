/**
 * MenuPage Component
 * Página principal del módulo de menú
 */

import { useMenuController } from '../../controllers/menu/useMenuController'
import MenuList from './MenuList'
import MenuCategories from './MenuCategories'
import MenuOrderSummary from './MenuOrderSummary'
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react'

const MenuPage = () => {
  const {
    menuItems,
    loading,
    error,
    selectedCategory,
    categories,
    orderItems,
    searchQuery,
    orderTotal,
    orderPoints,
    filterByCategory,
    handleSearch,
    addToOrder,
    removeFromOrder,
    clearOrder,
    getItemQuantity,
    goBack
  } = useMenuController()

  const totalItemsInOrder = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-surface-secondary pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-primary shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primaryClr"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-text-primary">Menú</h1>
          </div>

          {/* Carrito */}
          <div className="relative">
            <button className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primaryClr">
              <ShoppingCart size={24} />
            </button>
            {totalItemsInOrder > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primaryClr text-xs font-bold text-white">
                {totalItemsInOrder}
              </span>
            )}
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar en el menú..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-full border border-input-border bg-surface-secondary py-2 pl-10 pr-4 text-text-primary placeholder-text-muted focus:border-primaryClr focus:outline-none focus:ring-2 focus:ring-primaryClr/20"
            />
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* Categorías */}
        <MenuCategories
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={filterByCategory}
        />
      </header>

      {/* Contenido */}
      <main className="px-4 py-4">
        {error && (
          <div className="mb-4 rounded-lg bg-alert-error-bg p-4 text-alert-error-text">
            {error}
          </div>
        )}

        <MenuList
          items={menuItems}
          loading={loading}
          onAddItem={addToOrder}
          onRemoveItem={removeFromOrder}
          getItemQuantity={getItemQuantity}
        />
      </main>

      {/* Resumen del pedido (fijo abajo) */}
      {orderItems.length > 0 && (
        <MenuOrderSummary
          orderItems={orderItems}
          orderTotal={orderTotal}
          orderPoints={orderPoints}
          onClearOrder={clearOrder}
        />
      )}
    </div>
  )
}

export default MenuPage
