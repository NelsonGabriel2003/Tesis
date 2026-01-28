export const initialMenuState = {
  items: [],
  loading: false,
  error: null,
  selectedCategory: 'todos'
}

export const menuCategories = [
  { id: 'todos', name: 'Todos', icon: '🍽️' },
  { id: 'bebidas', name: 'Bebidas', icon: '🍺' },
  { id: 'cocteles', name: 'Cócteles', icon: '🍹' },
  { id: 'snacks', name: 'Snacks', icon: '🍕' },
  { id: 'promociones', name: 'Promos', icon: '🔥' }
]
export const menuMessages = {
  LOADING: 'Cargando menú...',
  ERROR: 'Error al cargar el menú',
  EMPTY: 'No hay productos disponibles',
  ADDED_TO_ORDER: 'Producto agregado a tu pedido'
}
