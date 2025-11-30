/**
 * Canje Model
 * Estados iniciales y datos mock para el módulo de canje de puntos
 */

// Estado inicial
export const initialCanjeState = {
  rewards: [],
  loading: false,
  error: null,
  selectedCategory: 'todos'
}

// Categorías de recompensas
export const canjeCategories = [
  { id: 'todos', name: 'Todos', icon: '🎁' },
  { id: 'bebidas', name: 'Bebidas', icon: '🍹' },
  { id: 'comida', name: 'Comida', icon: '🍕' },
  { id: 'descuentos', name: 'Descuentos', icon: '💰' },
  { id: 'experiencias', name: 'Experiencias', icon: '⭐' }
]

// Datos mock de recompensas canjeables
export const mockRewards = [
  {
    id: 1,
    name: 'Cerveza Gratis',
    description: 'Una cerveza artesanal de 500ml a elección',
    pointsCost: 100,
    category: 'bebidas',
    image: '/images/beer.jpg',
    stock: 50,
    popular: true
  },
  {
    id: 2,
    name: 'Cóctel Premium',
    description: 'Cualquier cóctel de nuestra carta premium',
    pointsCost: 200,
    category: 'bebidas',
    image: '/images/cocktail.jpg',
    stock: 30,
    popular: true
  },
  {
    id: 3,
    name: 'Nachos con Todo',
    description: 'Porción de nachos con queso, guacamole y crema',
    pointsCost: 150,
    category: 'comida',
    image: '/images/nachos.jpg',
    stock: 40,
    popular: false
  },
  {
    id: 4,
    name: 'Alitas x6',
    description: '6 alitas de pollo en salsa a elección',
    pointsCost: 180,
    category: 'comida',
    image: '/images/wings.jpg',
    stock: 25,
    popular: false
  },
  {
    id: 5,
    name: '10% Descuento',
    description: 'Descuento del 10% en tu próxima compra',
    pointsCost: 250,
    category: 'descuentos',
    image: '/images/discount.jpg',
    stock: 100,
    popular: true
  },
  {
    id: 6,
    name: '25% Descuento',
    description: 'Descuento del 25% en tu próxima compra',
    pointsCost: 500,
    category: 'descuentos',
    image: '/images/discount.jpg',
    stock: 50,
    popular: false
  },
  {
    id: 7,
    name: 'Mesa VIP por 1 hora',
    description: 'Acceso a zona VIP con servicio exclusivo',
    pointsCost: 800,
    category: 'experiencias',
    image: '/images/vip.jpg',
    stock: 10,
    popular: true
  },
  {
    id: 8,
    name: 'Fiesta de Cumpleaños',
    description: 'Decoración + pastel + 1 botella de cortesía',
    pointsCost: 1500,
    category: 'experiencias',
    image: '/images/birthday.jpg',
    stock: 5,
    popular: false
  },
  {
    id: 9,
    name: 'Shot de Tequila',
    description: 'Un shot de tequila premium',
    pointsCost: 75,
    category: 'bebidas',
    image: '/images/tequila.jpg',
    stock: 100,
    popular: false
  },
  {
    id: 10,
    name: 'Combo 2x1 Bebidas',
    description: '2x1 en cualquier bebida de la carta',
    pointsCost: 300,
    category: 'descuentos',
    image: '/images/2x1.jpg',
    stock: 30,
    popular: true
  }
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
