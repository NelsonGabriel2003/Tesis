export const initialMenuState = {
  items: [],
  loading: false,
  error: null,
  selectedCategory: 'todos'
}

export const menuMessages = {
  LOADING: 'Cargando menú...',
  ERROR: 'Error al cargar el menú',
  EMPTY: 'No hay productos disponibles',
  ADDED_TO_ORDER: 'Producto agregado a tu pedido'
}
