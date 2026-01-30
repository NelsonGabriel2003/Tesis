export const initialMenuState = {
  items: [],
  loading: false,
  error: null,
  selectedCategory: 'todos'
}

export const menuCategories = [
  { id: 'todos', name: 'Todos' },
  { id: 'Bebidas', name: 'Bebidas' },
  { id: 'Cócteles', name: 'Cócteles' },
  { id: 'Snacks', name: 'Snacks' },
  { id: 'Comida', name: 'Comida' },
  { id: 'Promos', name: 'Promos' }
]
export const menuMessages = {
  LOADING: 'Cargando menú...',
  ERROR: 'Error al cargar el menú',
  EMPTY: 'No hay productos disponibles',
  ADDED_TO_ORDER: 'Producto agregado a tu pedido'
}
