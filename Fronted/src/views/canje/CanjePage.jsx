/**
 * CanjePage Component
 * Página principal del módulo de canje de puntos
 */

import { useCanjeController } from '../../controllers/canje/useCanjeController'
import CanjeList from './CanjeList'
import CanjeModal from './CanjeModal'
import { ArrowLeft, Search, Star } from 'lucide-react'

const CanjePage = () => {
  const {
    rewards,
    loading,
    error,
    selectedCategory,
    categories,
    selectedReward,
    showModal,
    redeemStatus,
    searchQuery,
    userPoints,
    filterByCategory,
    handleSearch,
    selectReward,
    closeModal,
    redeemReward,
    canRedeem,
    goBack
  } = useCanjeController()

  return (
    <div className="min-h-screen bg-surface-secondary pb-6">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-400 via-blue-300 to-purple-300 border-b border-blue-200 shadow-md px-4 py-4">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primary"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-text-primary">Canjear Puntos</h1>
          </div>

          {/* Puntos del usuario */}
          <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
            <Star size={16} fill="currentColor" />
            {userPoints.toLocaleString()} pts
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar recompensas..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-full border border-input-border bg-surface-secondary py-2 pl-10 pr-4 text-text-primary placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => filterByCategory(category.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-primary text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Contenido */}
      <main className="px-4 py-4">
        {error && (
          <div className="mb-4 rounded-lg bg-alert-error-bg p-4 text-alert-error-text">
            {error}
          </div>
        )}

        <CanjeList
          rewards={rewards}
          loading={loading}
          onSelectReward={selectReward}
          canRedeem={canRedeem}
          userPoints={userPoints}
        />
      </main>

      {/* Modal de detalle */}
      {showModal && selectedReward && (
        <CanjeModal
          reward={selectedReward}
          canRedeem={canRedeem(selectedReward)}
          userPoints={userPoints}
          redeemStatus={redeemStatus}
          onRedeem={redeemReward}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default CanjePage