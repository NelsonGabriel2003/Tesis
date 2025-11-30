/**
 * Perfil Model
 * Estados iniciales y datos mock para el módulo de perfil
 */

// Estado inicial del perfil
export const initialPerfilState = {
  user: null,
  loading: false,
  error: null
}

// Datos mock del usuario
export const mockUserData = {
  id: 1,
  name: 'Juan Pérez',
  email: 'juan.perez@email.com',
  phone: '+51 999 888 777',
  avatar: null,
  memberSince: '2024-01-15',
  membershipLevel: 'gold',
  points: {
    current: 1250,
    total: 3500,
    nextLevel: 2000,
    history: [
      { id: 1, date: '2025-01-20', description: 'Compra - Combo Happy Hour', points: 35, type: 'earned' },
      { id: 2, date: '2025-01-18', description: 'Compra - Mojito Clásico', points: 15, type: 'earned' },
      { id: 3, date: '2025-01-15', description: 'Canje - Cerveza Gratis', points: -100, type: 'redeemed' },
      { id: 4, date: '2025-01-10', description: 'Compra - Alitas BBQ', points: 25, type: 'earned' },
      { id: 5, date: '2025-01-08', description: 'Bono de Cumpleaños', points: 200, type: 'bonus' },
      { id: 6, date: '2025-01-05', description: 'Compra - Pisco Sour x2', points: 36, type: 'earned' }
    ]
  },
  stats: {
    totalVisits: 24,
    totalSpent: 450.50,
    favoriteItem: 'Mojito Clásico',
    lastVisit: '2025-01-20'
  }
}

// Niveles de membresía
export const membershipLevels = {
  bronze: {
    name: 'Bronce',
    icon: '🥉',
    color: 'bg-amber-600',
    minPoints: 0,
    benefits: ['1 punto por cada $1', 'Acceso a promociones básicas']
  },
  silver: {
    name: 'Plata',
    icon: '🥈',
    color: 'bg-gray-400',
    minPoints: 500,
    benefits: ['1.5 puntos por cada $1', 'Descuento 5% en cumpleaños', 'Acceso a eventos especiales']
  },
  gold: {
    name: 'Oro',
    icon: '🥇',
    color: 'bg-yellow-500',
    minPoints: 1500,
    benefits: ['2 puntos por cada $1', 'Descuento 10% en cumpleaños', 'Reserva prioritaria', 'Bebida de cortesía mensual']
  },
  platinum: {
    name: 'Platino',
    icon: '💎',
    color: 'bg-purple-500',
    minPoints: 5000,
    benefits: ['3 puntos por cada $1', 'Descuento 20% en cumpleaños', 'Acceso VIP', 'Estacionamiento gratis', 'Mesa reservada permanente']
  }
}

// Mensajes
export const perfilMessages = {
  LOADING: 'Cargando perfil...',
  ERROR: 'Error al cargar el perfil',
  UPDATE_SUCCESS: 'Perfil actualizado correctamente',
  UPDATE_ERROR: 'Error al actualizar el perfil'
}
