export const initialServiciosState = {
  services: [],
  loading: false,
  error: null,
  selectedCategory: 'todos'
}


// Mensajes
export const serviciosMessages = {
  LOADING: 'Cargando servicios...',
  ERROR: 'Error al cargar los servicios',
  EMPTY: 'No hay servicios disponibles',
  RESERVED: 'Servicio reservado exitosamente',
  INSUFFICIENT_POINTS: 'No tienes suficientes puntos'
}
