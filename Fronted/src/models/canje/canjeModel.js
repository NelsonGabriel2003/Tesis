/**
 * Canje Model
 * Estados iniciales y configuración para el módulo de canje de puntos
 */

// Estado inicial
export const initialCanjeState = {
  rewards: [],
  loading: false,
  error: null,
  selectedCategory: 'todos'
}
// Categorías de canje
export const canjeCategories = [
  { id: 'todos', name: 'Todos', icon: '🎁' },
  { id: 'bebidas', name: 'Bebidas', icon: '🍺' },
  { id: 'comida', name: 'Comida', icon: '🍔' },
  { id: 'descuentos', name: 'Descuentos', icon: '💰' },
  { id: 'experiencias', name: 'Experiencias', icon: '⭐' }
]
// Mensajes
export const canjeMessages = {
  LOADING: 'Cargando recompensas...',
  ERROR: 'Error al cargar las recompensas',
  EMPTY: 'No hay recompensas disponibles',
  SUCCESS: '¡Canje realizado exitosamente!',
  INSUFFICIENT_POINTS: 'No tienes suficientes puntos',
  OUT_OF_STOCK: 'Esta recompensa está agotada'
}
