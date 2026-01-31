/**
 * Perfil Model
 * Estado inicial y constantes para el módulo de perfil
 * 
 * NOTA: Los niveles de membresía se cargan dinámicamente desde la BD
 * a través de perfilServices.getMembershipConfig()
 */

// Estado inicial del perfil
export const initialPerfilState = {
  user: null,
  loading: false,
  error: null,
  membershipConfig: null  // Se carga desde la API
}

// Valores por defecto de membresía (fallback si la API falla)
export const defaultMembershipLevels = {
  bronce: {
    name: 'Bronce',
    icon: '🥉',
    color: 'bg-amber-600',
    minPoints: 0,
    multiplier: 1
  },
  plata: {
    name: 'Plata',
    icon: '🥈',
    color: 'bg-gray-400',
    minPoints: 500,
    multiplier: 1.5
  },
  oro: {
    name: 'Oro',
    icon: '🥇',
    color: 'bg-yellow-500',
    minPoints: 1500,
    multiplier: 2
  },
  platino: {
    name: 'Platino',
    icon: '💎',
    color: 'bg-purple-500',
    minPoints: 5000,
    multiplier: 3
  }
}

// Mensajes
export const perfilMessages = {
  LOADING: 'Cargando perfil...',
  ERROR: 'Error al cargar el perfil',
  UPDATE_SUCCESS: 'Perfil actualizado correctamente',
  UPDATE_ERROR: 'Error al actualizar el perfil'
}