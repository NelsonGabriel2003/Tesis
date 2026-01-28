/**
 * RewardsAdmin Component
 * Gestión de recompensas canjeables
 */

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, X, Loader, Star } from 'lucide-react'
import { useRewardController } from '../../controllers/admin'
import { rewardCategories } from '../../models/admin'

const RewardsAdmin = () => {
  const {
    rewards,
    loading,
    error,
    formData,
    isModalOpen,
    isEditing,
    notification,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    saveReward,
    deleteReward
  } = useRewardController()

  const [searchQuery, setSearchQuery] = useState('')

  // Filtrar recompensas
  const filteredRewards = rewards.filter(reward =>
    reward.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reward.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Recompensas</h1>
          <p className="text-gray-500">Gestiona las recompensas canjeables</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg
            hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Recompensa</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar recompensas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg ${
            notification.type === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !isModalOpen && (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-purple-600" size={40} />
        </div>
      )}

      {/* Rewards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              {/* Popular badge */}
              {reward.isPopular && (
                <div className="flex items-center gap-1 text-yellow-500 text-sm mb-2">
                  <Star size={14} fill="currentColor" />
                  <span>Popular</span>
                </div>
              )}

              {/* Name & Description */}
              <h3 className="font-bold text-gray-800 text-lg">{reward.name}</h3>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                {reward.description}
              </p>

              {/* Points & Stock */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-purple-600 font-bold text-lg">
                  {reward.pointsCost} pts
                </span>
                <span className="text-gray-500 text-sm">
                  Stock: {reward.stock}
                </span>
              </div>

              {/* Category */}
              <span className="inline-block mt-3 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {reward.category}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => openEditModal(reward)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2
                    text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => deleteReward(reward.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2
                    text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredRewards.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No hay recompensas registradas</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Editar Recompensa' : 'Nueva Recompensa'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={saveReward} className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Cerveza Gratis"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descripción de la recompensa..."
                />
              </div>

              {/* Puntos y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo (puntos) *
                  </label>
                  <input
                    type="number"
                    name="points_cost"
                    value={formData.points_cost}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {rewardCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL de imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de imagen
                </label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="/images/recompensa.jpg"
                />
              </div>

              {/* Popular checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_popular"
                  id="is_popular"
                  checked={formData.is_popular}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_popular" className="text-sm text-gray-700">
                  Marcar como popular
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg
                    hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg
                    hover:bg-purple-700 transition-colors disabled:opacity-50
                    flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="animate-spin" size={18} />}
                  {isEditing ? 'Guardar Cambios' : 'Crear Recompensa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RewardsAdmin
