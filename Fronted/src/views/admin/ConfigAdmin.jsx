/**
 * ConfigAdmin Component
 * Gestión de configuración del negocio
 */

import {
  Save,
  RotateCcw,
  Loader,
  RefreshCw,
  AlertCircle,
  Settings,
  DollarSign,
  Trophy
} from 'lucide-react'
import { useConfigController } from '../../controllers/admin/useConfigController'


const inputBaseClass = "px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"

const NumberInput = ({ value, onChange, isMultiplier }) => (
  <input
    type="number"
    step={isMultiplier ? '0.1' : '1'}
    min="0"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full ${inputBaseClass}`}
  />
)

const EmojiInput = ({ value, onChange }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-24 text-center text-2xl ${inputBaseClass}`}
    maxLength={2}
  />
)

const ColorInput = ({ value, onChange, options }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(color => (
      <button
        key={color.value}
        type="button"
        onClick={() => onChange(color.value)}
        className={`w-10 h-10 rounded-lg ${color.preview} ${
          value === color.value ? 'ring-2 ring-offset-2 ring-purple-500' : ''
        }`}
        title={color.label}
      />
    ))}
  </div>
)

const TextInput = ({ value, onChange }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full ${inputBaseClass}`}
  />
)

// ============================================
// CONFIGURACIONES
// ============================================

const COLOR_OPTIONS = [
  { value: 'bg-amber-600', label: 'Ámbar', preview: 'bg-amber-600' },
  { value: 'bg-gray-400', label: 'Gris', preview: 'bg-gray-400' },
  { value: 'bg-yellow-500', label: 'Amarillo', preview: 'bg-yellow-500' },
  { value: 'bg-purple-500', label: 'Púrpura', preview: 'bg-purple-500' },
  { value: 'bg-blue-500', label: 'Azul', preview: 'bg-blue-500' },
  { value: 'bg-green-500', label: 'Verde', preview: 'bg-green-500' },
  { value: 'bg-red-500', label: 'Rojo', preview: 'bg-red-500' },
  { value: 'bg-pink-500', label: 'Rosa', preview: 'bg-pink-500' }
]

const CATEGORY_ICONS = {
  puntos: <DollarSign size={24} className="text-green-600" />,
  membresia: <Trophy size={24} className="text-yellow-600" />,
  general: <Settings size={24} className="text-gray-600" />
}

const MEMBERSHIP_LEVELS = ['bronce', 'plata', 'oro', 'platino']

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ConfigAdmin = () => {
  const {
    loading,
    saving,
    error,
    notification,
    editedValues,
    loadConfigs,
    handleValueChange,
    saveChanges,
    discardChanges,
    hasChanges,
    groupedConfigs,
    getCategoryName,
    getConfigLabel,
    getInputType
  } = useConfigController()

  // Renderizar input según tipo usando switch
  const renderInput = (config) => {
    const type = getInputType(config.key)
    const value = editedValues[config.key] ?? config.value
    const onChange = (val) => handleValueChange(config.key, val)

    switch (type) {
      case 'number':
        return (
          <NumberInput 
            value={value} 
            onChange={onChange} 
            isMultiplier={config.key.includes('multiplicador')} 
          />
        )
      case 'emoji':
        return <EmojiInput value={value} onChange={onChange} />
      case 'color':
        return <ColorInput value={value} onChange={onChange} options={COLOR_OPTIONS} />
      default:
        return <TextInput value={value} onChange={onChange} />
    }
  }

  const groups = groupedConfigs()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header 
        loading={loading}
        saving={saving}
        hasChanges={hasChanges()}
        onRefresh={loadConfigs}
        onDiscard={discardChanges}
        onSave={saveChanges}
      />

      {/* Notification */}
      {notification && <Notification {...notification} />}

      {/* Error */}
      {error && <Notification message={error} type="error" />}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-purple-600" size={40} />
        </div>
      )}

      {/* Config Groups */}
      {!loading && (
        <div className="space-y-6">
          {Object.entries(groups).map(([category, categoryConfigs]) => (
            <ConfigGroup
              key={category}
              category={category}
              configs={categoryConfigs}
              icon={CATEGORY_ICONS[category]}
              categoryName={getCategoryName(category)}
              editedValues={editedValues}
              getConfigLabel={getConfigLabel}
              renderInput={renderInput}
            />
          ))}
        </div>
      )}

      {/* Preview de Membresías */}
      {!loading && groups['membresia'] && (
        <MembershipPreview levels={MEMBERSHIP_LEVELS} editedValues={editedValues} />
      )}
    </div>
  )
}

// ============================================
// SUBCOMPONENTES
// ============================================

const Header = ({ loading, saving, hasChanges, onRefresh, onDiscard, onSave }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
      <p className="text-gray-500">Gestiona los parámetros del sistema de fidelización</p>
    </div>
    <div className="flex gap-2">
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
      </button>
      {hasChanges && (
        <>
          <button
            onClick={onDiscard}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RotateCcw size={20} />
            <span className="hidden sm:inline">Descartar</span>
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
            <span>Guardar</span>
          </button>
        </>
      )}
    </div>
  </div>
)

const Notification = ({ message, type }) => {
  const styles = {
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700'
  }
  
  return (
    <div className={`p-4 rounded-lg flex items-center gap-2 ${styles[type] || styles.success}`}>
      <AlertCircle size={20} />
      {message}
    </div>
  )
}

const ConfigGroup = ({ category, configs, icon, categoryName, editedValues, getConfigLabel, renderInput }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b">
      {icon || <Settings size={24} />}
      <h2 className="text-lg font-bold text-gray-800">{categoryName}</h2>
    </div>
    <div className="p-6 space-y-6">
      {configs.map(config => (
        <ConfigItem
          key={config.key}
          config={config}
          isModified={config.value !== editedValues[config.key]}
          label={getConfigLabel(config.key)}
          renderInput={renderInput}
        />
      ))}
    </div>
  </div>
)

const ConfigItem = ({ config, isModified, label, renderInput }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
    <div className="flex-1">
      <label className="block font-medium text-gray-700">
        {label}
        {isModified && (
          <span className="ml-2 text-xs text-orange-500 font-normal">(modificado)</span>
        )}
      </label>
      {config.description && (
        <p className="text-sm text-gray-500">{config.description}</p>
      )}
    </div>
    <div className="sm:w-64">
      {renderInput(config)}
    </div>
  </div>
)

const MembershipPreview = ({ levels, editedValues }) => {
  // Valores por defecto
  const defaults = {
    bronce: { color: 'bg-amber-600', icon: '🥉', umbral: 0 },
    plata: { color: 'bg-gray-400', icon: '🥈', umbral: 500 },
    oro: { color: 'bg-yellow-500', icon: '🥇', umbral: 1500 },
    platino: { color: 'bg-purple-500', icon: '💎', umbral: 5000 }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-lg font-bold text-gray-800">👀 Vista Previa de Niveles</h2>
      </div>
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {levels.map(level => {
          const umbral = editedValues[`umbral_${level}`] || defaults[level]?.umbral || 0
          const multiplicador = editedValues[`multiplicador_${level}`] || 1
          const color = editedValues[`color_${level}`] || defaults[level]?.color || 'bg-gray-400'
          const icon = editedValues[`icon_${level}`] || defaults[level]?.icon || '🏆'
          
          return (
            <div
              key={level}
              className={`p-4 rounded-xl text-white text-center ${color}`}
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="font-bold capitalize">{level}</div>
              <div className="text-sm opacity-80">{umbral}+ pts</div>
              <div className="text-sm opacity-80">x{multiplicador}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ConfigAdmin