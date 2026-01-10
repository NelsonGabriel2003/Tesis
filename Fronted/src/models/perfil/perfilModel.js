// Estado inicial del perfil
export const initialPerfilState = {
  user: null,
  loading: false,
  error: null
}

export const membershipLevels = {
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
