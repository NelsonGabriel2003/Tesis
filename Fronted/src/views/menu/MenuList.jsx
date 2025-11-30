/**
 * MenuList Component
 * Lista de items del menú
 */

import { Plus, Minus, Star } from 'lucide-react'

const MenuList = ({ items, loading, onAddItem, onRemoveItem, getItemQuantity }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="animate-pulse rounded-2xl bg-surface-primary p-4 shadow-md"
          >
            <div className="mb-3 h-32 rounded-xl bg-surface-secondary" />
            <div className="mb-2 h-5 w-3/4 rounded bg-surface-secondary" />
            <div className="mb-3 h-4 w-1/2 rounded bg-surface-secondary" />
            <div className="h-8 rounded-full bg-surface-secondary" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-6xl">🍽️</div>
        <h3 className="mb-2 text-lg font-semibold text-text-primary">
          No hay productos
        </h3>
        <p className="text-text-muted">
          No se encontraron productos en esta categoría
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const quantity = getItemQuantity(item.id)

        return (
          <div
            key={item.id}
            className={`overflow-hidden rounded-2xl bg-surface-primary shadow-md transition-all hover:shadow-lg ${
              !item.available ? 'opacity-60' : ''
            }`}
          >
            {/* Imagen placeholder */}
            <div className="relative h-32 bg-gradient-to-br from-primaryClr/20 to-purple-500/20">
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                {item.category === 'bebidas' && '🍺'}
                {item.category === 'cocteles' && '🍹'}
                {item.category === 'snacks' && '🍕'}
                {item.category === 'promociones' && '🔥'}
              </div>

              {/* Badge de puntos */}
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900">
                <Star size={12} fill="currentColor" />
                +{item.points} pts
              </div>

              {/* Badge no disponible */}
              {!item.available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                    No disponible
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="mb-1 font-semibold text-text-primary">
                {item.name}
              </h3>
              <p className="mb-3 text-sm text-text-muted line-clamp-2">
                {item.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primaryClr">
                  ${item.price.toFixed(2)}
                </span>

                {item.available && (
                  <div className="flex items-center gap-2">
                    {quantity > 0 ? (
                      <>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-6 text-center font-bold text-text-primary">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onAddItem(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primaryClr text-white transition-colors hover:bg-primaryClr/80"
                        >
                          <Plus size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onAddItem(item)}
                        className="flex items-center gap-1 rounded-full bg-primaryClr px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primaryClr/80"
                      >
                        <Plus size={16} />
                        Agregar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MenuList
