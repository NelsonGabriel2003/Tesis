export const initialServiciosState = {
  services: [],
  loading: false,
  error: null,
  selectedCategory: 'todos'
}

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
