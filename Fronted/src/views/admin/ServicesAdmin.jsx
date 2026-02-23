/**
 * ServicesAdmin Component
 * Gestión de servicios del bar
 */

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Loader, MessageCircle, Save, Check } from 'lucide-react'
import { useServiceController } from '../../controllers/admin'
import { serviceCategories } from '../../models/admin'
import ImageUpload from '../../components/ui/ImageUpload'
import SearchBar from '../../components/ui/SearchBar'
import api from '../../services/api'

const ServicesAdmin = () => {
  const {
    services,
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
    saveService,
    deleteService,
    fieldErrors,
    tieneErrores
  } = useServiceController()

  const [searchQuery, setSearchQuery] = useState('')
  const [whatsappNumero, setWhatsappNumero] = useState('')
  const [whatsappError, setWhatsappError] = useState('')
  const [guardandoWhatsapp, setGuardandoWhatsapp] = useState(false)
  const [whatsappGuardado, setWhatsappGuardado] = useState(false)

  useEffect(() => {
    const cargarWhatsapp = async () => {
      try {
        const response = await api.get('/config/whatsapp')
        setWhatsappNumero(response.data?.numero || '')
      } catch (err) {
        console.error('Error cargando WhatsApp:', err)
      }
    }
    cargarWhatsapp()
  }, [])

  const validarWhatsapp = (valor) => {
    if (!valor) return ''
    if (valor.length < 10) return 'Debe tener 10 digitos'
    if (!/^09[0-9]{8}$/.test(valor)) return 'Formato invalido. Debe ser 09XXXXXXXX'
    return ''
  }

  const manejarCambioWhatsapp = (e) => {
    const valor = e.target.value.replace(/\D/g, '')
    if (valor.length <= 10) {
      setWhatsappNumero(valor)
      setWhatsappError(valor.length === 10 ? validarWhatsapp(valor) : '')
      setWhatsappGuardado(false)
    }
  }

  const guardarWhatsapp = async () => {
    const errorValidacion = validarWhatsapp(whatsappNumero)
    if (errorValidacion) {
      setWhatsappError(errorValidacion)
      return
    }
    setGuardandoWhatsapp(true)
    try {
      await api.put('/config/whatsapp_reservas', { value: whatsappNumero })
      setWhatsappGuardado(true)
      setTimeout(() => setWhatsappGuardado(false), 3000)
    } catch (err) {
      console.error('Error guardando WhatsApp:', err)
    } finally {
      setGuardandoWhatsapp(false)
    }
  }

  // Filtrar servicios
  const filteredServices = services.filter(service =>
    service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handler para imagen
  const handleImageChange = (imageUrl) => {
    handleInputChange({
      target: { name: 'image_url', value: imageUrl }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
          <p className="text-gray-500">Gestiona los servicios del bar</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg
            hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* WhatsApp Config */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="text-green-600" size={20} />
          <p className="font-medium text-green-800">Numero de WhatsApp para reservas</p>
        </div>
        <div className="flex gap-2">
          <input
            type="tel"
            value={whatsappNumero}
            onChange={manejarCambioWhatsapp}
            placeholder="0999999999"
            maxLength={10}
            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              whatsappError ? 'border-red-400' : 'border-green-300'
            }`}
          />
          <button
            onClick={guardarWhatsapp}
            disabled={guardandoWhatsapp || !!whatsappError}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {guardandoWhatsapp ? (
              <Loader size={18} className="animate-spin" />
            ) : whatsappGuardado ? (
              <Check size={18} />
            ) : (
              <Save size={18} />
            )}
            {whatsappGuardado ? 'Guardado' : 'Guardar'}
          </button>
        </div>
        {whatsappError && (
          <p className="mt-2 text-xs text-red-500">{whatsappError}</p>
        )}
      </div>

      {/* Search con contador */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Buscar servicios..."
        resultsCount={filteredServices.length}
        totalCount={services.length}
      />

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

      {/* Services Table */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Servicio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {service.imageUrl ? (
                          <img 
                            src={service.imageUrl} 
                            alt={service.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                            🛎️
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{service.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        service.available !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {service.available !== false ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay servicios registrados</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={saveService} className="p-6 space-y-4">
              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen del servicio
                </label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={handleImageChange}
                />
              </div>

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
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ej: Reserva de Mesa"
                />
                {fieldErrors.name && <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>}
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
                  placeholder="Descripción del servicio..."
                />
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
                  className={`w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${fieldErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleccionar categoría</option>
                  {serviceCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && <p className="mt-1 text-sm text-red-500">{fieldErrors.category}</p>}
              </div>

              {/* Disponible */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="available"
                  id="available"
                  checked={formData.available !== false}
                  onChange={(e) => handleInputChange({
                    target: { name: 'available', value: e.target.checked }
                  })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="available" className="text-sm text-gray-700">
                  Servicio disponible para reservas
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
                  disabled={loading || tieneErrores}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg
                    hover:bg-purple-700 transition-colors disabled:opacity-50
                    flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="animate-spin" size={18} />}
                  {isEditing ? 'Guardar Cambios' : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServicesAdmin