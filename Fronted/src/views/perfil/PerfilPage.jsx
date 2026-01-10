/**
 * PerfilPage Component
 * Página principal del módulo de perfil
 */

import { usePerfilController } from '../../controllers/perfil/usePerfilController'
import PerfilHeader from './PerfilHeader'
import PerfilInfo from './PerfilInfo'
import PerfilPoints from './PerfilPoints'
import PerfilStats from './PerfilStats'
import { ArrowLeft, User, Star, BarChart3, LogOut } from 'lucide-react'

const PerfilPage = () => {
  const {
    user,
    loading,
    error,
    activeTab,
    isEditing,
    editData,
    membershipInfo,
    progress,
    setActiveTab,
    setIsEditing,
    handleEditChange,
    updateProfile,
    cancelEdit,
    formatDate,
    handleLogout,
    goBack
  } = usePerfilController()

  const tabs = [
    { id: 'info', label: 'Info', icon: User },
    { id: 'points', label: 'Puntos', icon: Star },
    { id: 'stats', label: 'Stats', icon: BarChart3 }
  ]

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-secondary">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primaryClr border-t-transparent" />
          <p className="text-text-muted">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-secondary pb-6">
      {/* Header */}
      <header className="bg-gradient-to-br from-primaryClr to-purple-600 px-4 pb-20 pt-4 text-white">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="rounded-full p-2 transition-colors hover:bg-white/20"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Mi Perfil</h1>
          <button
            onClick={handleLogout}
            className="rounded-full p-2 transition-colors hover:bg-white/20"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* Card de perfil superpuesta */}
      <div className="-mt-16 px-4">
        {user && (
          <PerfilHeader
            user={user}
            membershipInfo={membershipInfo}
            progress={progress}
            formatDate={formatDate}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 rounded-lg bg-alert-error-bg p-4 text-alert-error-text">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 px-4">
        <div className="flex gap-2 rounded-full bg-surface-primary p-1 shadow-md">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primaryClr text-white'
                    : 'text-text-secondary hover:text-primaryClr'
                }`}
              >
                <IconComponent size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenido del tab activo */}
      <div className="mt-6 px-4">
        {activeTab === 'info' && user && (
          <PerfilInfo
            user={user}
            isEditing={isEditing}
            editData={editData}
            loading={loading}
            onEdit={() => setIsEditing(true)}
            onCancel={cancelEdit}
            onSave={updateProfile}
            onChange={handleEditChange}
          />
        )}

        {activeTab === 'points' && user && (
          <PerfilPoints
            points={user.points}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'stats' && user && (
          <PerfilStats
            stats={user.stats}
            formatDate={formatDate}
            userPoints={user.points?.current || 0}
          />
        )}
      </div>
    </div>
  )
}

export default PerfilPage
