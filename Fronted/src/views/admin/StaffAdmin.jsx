/**
 * StaffAdmin Component
 * Gestión del personal y vinculación con Telegram
 */

import { useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Loader,
  RefreshCw,
  MessageCircle,
  Link2,
  Link2Off,
  Copy,
  Check,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react'
import { useStaffController } from '../../controllers/admin'
import { staffRoles } from '../../models/admin/adminModel'
import SearchBar from '../../components/ui/SearchBar'

const StaffAdmin = () => {
  const {
    staff,
    loading,
    error,
    formData,
    isModalOpen,
    isEditing,
    notification,
    linkCodeModal,
    loadStaff,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    saveStaff,
    deleteStaff,
    generateLinkCode,
    closeLinkCodeModal,
    unlinkTelegram,
    filterStaff
  } = useStaffController()

  const [searchQuery, setSearchQuery] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)

  // Filtrar staff
  const filteredStaff = filterStaff(searchQuery)

  // Copiar código
  const copyCode = () => {
    navigator.clipboard.writeText(linkCodeModal.linkCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  // Formatear fecha de expiración
  const formatExpiry = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('es-EC', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obtener nombre del rol
  const getRoleName = (roleId) => {
    const role = staffRoles.find(r => r.id === roleId)
    return role?.name || roleId
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Personal</h1>
          <p className="text-gray-500">Gestiona el staff y vinculacion con Telegram</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadStaff}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus size={20} />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      {/* Search con contador */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Buscar personal..."
        resultsCount={filteredStaff.length}
        totalCount={staff.length}
      />

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Error */}
      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {/* Loading */}
      {loading && !isModalOpen && (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-purple-600" size={40} />
        </div>
      )}

      {/* Staff Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                    ${member.telegramLinked ? 'bg-green-500' : 'bg-gray-400'}`}>
                    {member.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{member.name}</h3>
                    <p className="text-sm text-gray-500">{getRoleName(member.role)}</p>
                  </div>
                </div>
                {member.isOnShift ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <UserCheck size={12} /> En turno
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    <UserX size={12} /> Fuera
                  </span>
                )}
              </div>

              {/* Contact Info */}
              {member.email && (
                <p className="text-sm text-gray-600 mb-1">{member.email}</p>
              )}
              {member.phone && (
                <p className="text-sm text-gray-600 mb-3">{member.phone}</p>
              )}

              {/* Telegram Status */}
              <div className="border-t pt-3 mt-3">
                {member.telegramLinked ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600">
                      <MessageCircle size={16} />
                      <span className="text-sm">@{member.telegramUsername || 'vinculado'}</span>
                    </div>
                    <button
                      onClick={() => unlinkTelegram(member.id, member.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Desvincular Telegram"
                    >
                      <Link2Off size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    {member.linkCode ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {member.linkCode}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {formatExpiry(member.linkCodeExpires)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin vincular</span>
                    )}
                    <button
                      onClick={() => generateLinkCode(member.id, member.name)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      <Link2 size={14} />
                      Generar
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <button
                  onClick={() => openEditModal(member)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit size={16} /> Editar
                </button>
                <button
                  onClick={() => deleteStaff(member.id, member.name)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredStaff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No hay personal registrado</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Editar Personal' : 'Nuevo Personal'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0999999999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {staffRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="animate-spin" size={18} />}
                  {isEditing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Code Modal */}
      {linkCodeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-purple-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Codigo de Vinculacion
            </h2>
            <p className="text-gray-500 mb-4">
              Para: <strong>{linkCodeModal.staffName}</strong>
            </p>

            <div className="bg-gray-100 rounded-xl p-4 mb-4">
              <p className="text-3xl font-mono font-bold text-purple-600 tracking-wider">
                {linkCodeModal.linkCode}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Valido hasta: {formatExpiry(linkCodeModal.expiresAt)}
              </p>
            </div>

            <button
              onClick={copyCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mb-3"
            >
              {codeCopied ? <Check size={20} /> : <Copy size={20} />}
              {codeCopied ? 'Copiado!' : 'Copiar Codigo'}
            </button>

            <p className="text-sm text-gray-500 mb-4">
              El mesero debe escribir en Telegram:<br />
              <code className="bg-gray-100 px-2 py-1 rounded">/vincular {linkCodeModal.linkCode}</code>
            </p>

            <button
              onClick={closeLinkCodeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffAdmin
