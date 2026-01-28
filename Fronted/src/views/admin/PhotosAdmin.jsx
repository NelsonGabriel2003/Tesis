/**
 * PhotosAdmin Component
 * Gestion de fotos/eventos del carrusel
 */

import { useState } from 'react'
import { Plus, Edit, Trash2, X, Loader, Eye, EyeOff } from 'lucide-react'
import { usePhotoController } from '../../controllers/admin'
import ImageUpload from '../../components/ui/ImageUpload'

const PhotosAdmin = () => {
  const {
    photos,
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
    savePhoto,
    deletePhoto,
    toggleActive
  } = usePhotoController()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fotos</h1>
          <p className="text-gray-500">Gestiona las fotos del carrusel principal</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg
            hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Foto</span>
        </button>
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

      {/* Photos Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                !photo.isActive ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
                {!photo.isActive && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full">
                      Inactiva
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{photo.title}</h3>
                {photo.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{photo.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex items-center justify-between">
                <button
                  onClick={() => toggleActive(photo)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    photo.isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {photo.isActive ? (
                    <>
                      <Eye size={16} />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} />
                      <span>Oculta</span>
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(photo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && photos.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500 mb-4">No hay fotos registradas</p>
          <button
            onClick={openCreateModal}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Agregar primera foto
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Editar Foto' : 'Nueva Foto'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={savePhoto} className="p-6 space-y-4">
              {/* Titulo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titulo *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Noche de Karaoke"
                  required
                />
              </div>

              {/* Descripcion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripcion
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descripcion del evento o foto..."
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen *
                </label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => handleInputChange({
                    target: { name: 'image_url', value: url }
                  })}
                  onError={(error) => {
                    const event = new CustomEvent('showNotification', {
                      detail: { message: error, type: 'error' }
                    })
                    window.dispatchEvent(event)
                  }}
                />
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
                  {isEditing ? 'Guardar Cambios' : 'Crear Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotosAdmin
