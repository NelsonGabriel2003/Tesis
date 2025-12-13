/**
 * Servicios Model
 * Estados iniciales y datos mock para el módulo de servicios
 */

// Estado inicial
export const initialServiciosState = {
  services: [],
  loading: false,
  error: null
}

// Datos mock de servicios del bar
export const mockServicios = [
  {
    id: 1,
    name: 'Reserva de Mesa',
    description: 'Reserva tu mesa con anticipación para asegurar tu lugar',
    icon: '🪑',
    category: 'reservas',
    available: true,
    pointsRequired: 0,
    pointsReward: 50
  },
  {
    id: 2,
    name: 'Cumpleaños VIP',
    description: 'Decoración especial, pastel de cortesía y descuento del 20%',
    icon: '🎂',
    category: 'eventos',
    available: true,
    pointsRequired: 500,
    pointsReward: 100
  },
  {
    id: 3,
    name: 'Karaoke Privado',
    description: 'Sala privada con equipo de karaoke por 2 horas',
    icon: '🎤',
    category: 'entretenimiento',
    available: true,
    pointsRequired: 300,
    pointsReward: 75
  },
  {
    id: 4,
    name: 'DJ Request',
    description: 'Solicita tu canción favorita al DJ',
    icon: '🎵',
    category: 'entretenimiento',
    available: true,
    pointsRequired: 50,
    pointsReward: 10
  },
  {
    id: 5,
    name: 'Área VIP',
    description: 'Acceso al área exclusiva con servicio personalizado',
    icon: '⭐',
    category: 'exclusivo',
    available: true,
    pointsRequired: 1000,
    pointsReward: 200
  },
  {
    id: 6,
    name: 'Delivery a Domicilio',
    description: 'Recibe tu pedido en la comodidad de tu hogar',
    icon: '🚗',
    category: 'delivery',
    available: true,
    pointsRequired: 0,
    pointsReward: 25
  },
  {
    id: 7,
    name: 'Clase de Coctelería',
    description: 'Aprende a preparar cócteles con nuestro bartender',
    icon: '🍸',
    category: 'eventos',
    available: false,
    pointsRequired: 200,
    pointsReward: 100
  },
  {
    id: 8,
    name: 'Estacionamiento VIP',
    description: 'Lugar reservado de estacionamiento',
    icon: '🅿️',
    category: 'exclusivo',
    available: true,
    pointsRequired: 150,
    pointsReward: 30
  }
]

// Categorías de servicios
export const serviciosCategorias = [
  { id: 'todos', name: 'Todos', icon: '📋' },
  { id: 'reservas', name: 'Reservas', icon: '🪑' },
  { id: 'eventos', name: 'Eventos', icon: '🎉' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎵' },
  { id: 'exclusivo', name: 'VIP', icon: '⭐' },
  { id: 'delivery', name: 'Delivery', icon: '🚗' }
]

// Mensajes
export const serviciosMessages = {
  LOADING: 'Cargando servicios...',
  ERROR: 'Error al cargar los servicios',
  EMPTY: 'No hay servicios disponibles',
  RESERVED: 'Servicio reservado exitosamente',
  INSUFFICIENT_POINTS: 'No tienes suficientes puntos'
}
