/**
 * Menu Model
 * Estados iniciales y datos mock para el módulo de menú
 */

// Estado inicial del menú
export const initialMenuState = {
  items: [],
  loading: false,
  error: null,
  selectedCategory: 'todos'
}

// Categorías del menú
export const menuCategories = [
  { id: 'todos', name: 'Todos', icon: '🍽️' },
  { id: 'bebidas', name: 'Bebidas', icon: '🍺' },
  { id: 'cocteles', name: 'Cócteles', icon: '🍹' },
  { id: 'snacks', name: 'Snacks', icon: '🍕' },
  { id: 'promociones', name: 'Promos', icon: '🔥' }
]

// Datos mock del menú (sin base de datos)
export const mockMenuItems = [
  {
    id: 1,
    name: 'Cerveza Artesanal',
    description: 'Cerveza local premium 500ml',
    price: 5.50,
    points: 10,
    category: 'bebidas',
    image: '/images/beer.jpg',
    available: true
  },
  {
    id: 2,
    name: 'Mojito Clásico',
    description: 'Ron, menta, limón y soda',
    price: 8.00,
    points: 15,
    category: 'cocteles',
    image: '/images/mojito.jpg',
    available: true
  },
  {
    id: 3,
    name: 'Pisco Sour',
    description: 'Pisco, limón, clara de huevo',
    price: 9.50,
    points: 18,
    category: 'cocteles',
    image: '/images/pisco.jpg',
    available: true
  },
  {
    id: 4,
    name: 'Nachos con Queso',
    description: 'Nachos crujientes con queso fundido',
    price: 6.00,
    points: 12,
    category: 'snacks',
    image: '/images/nachos.jpg',
    available: true
  },
  {
    id: 5,
    name: 'Alitas BBQ',
    description: '8 alitas en salsa BBQ',
    price: 12.00,
    points: 25,
    category: 'snacks',
    image: '/images/wings.jpg',
    available: true
  },
  {
    id: 6,
    name: 'Combo Happy Hour',
    description: '2 cervezas + nachos',
    price: 14.00,
    points: 35,
    category: 'promociones',
    image: '/images/combo.jpg',
    available: true
  },
  {
    id: 7,
    name: 'Margarita',
    description: 'Tequila, triple sec y limón',
    price: 8.50,
    points: 16,
    category: 'cocteles',
    image: '/images/margarita.jpg',
    available: true
  },
  {
    id: 8,
    name: 'Whisky Premium',
    description: 'Shot de whisky 12 años',
    price: 12.00,
    points: 20,
    category: 'bebidas',
    image: '/images/whisky.jpg',
    available: false
  }
]

// Mensajes de estado
export const menuMessages = {
  LOADING: 'Cargando menú...',
  ERROR: 'Error al cargar el menú',
  EMPTY: 'No hay productos disponibles',
  ADDED_TO_ORDER: 'Producto agregado a tu pedido'
}
