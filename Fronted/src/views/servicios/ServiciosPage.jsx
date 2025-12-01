/**
 * ServiciosPage Component
 * Página principal del módulo de servicios
 */

import { useServiciosController } from '../../controllers/servicios/useServiciosController'
import ServiciosList from './ServiciosList'
import ServicioModal from './ServicioModal'
import { ArrowLeft, Star } from 'lucide-react'

const ServiciosPage = () => {
  const {
    services,
    loading,
    error,
    categories,
    selectedCategory,
    selectedService,
    showModal,
    reservationStatus,
    userPoints,
    filterByCategory,
    selectService,
    closeModal,
    reserveService,
    canUseService,
    goBack
  } = useServiciosController()

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-400 via-blue-300 to-purple-300 border-b border-blue-200 shadow-md px-4 py-4">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-primaryClr"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-text-primary">Servicios</h1>
          </div>

          {/* Puntos del usuario */}
          <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
            <Star size={16} fill="currentColor" />
            {userPoints.toLocaleString()} pts
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
                  ? 'bg-primaryClr text-white shadow-md'
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

        <ServiciosList
          services={services}
          loading={loading}
          onSelectService={selectService}
          canUseService={canUseService}
          userPoints={userPoints}
        />
      </main>

      {/* Modal de detalle */}
      {showModal && selectedService && (
        <ServicioModal
          service={selectedService}
          canUse={canUseService(selectedService)}
          userPoints={userPoints}
          reservationStatus={reservationStatus}
          onReserve={reserveService}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default ServiciosPage
