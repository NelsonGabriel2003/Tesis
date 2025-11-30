/**
 * Admin Model
 * Estados iniciales y constantes para el módulo administrativo
 */

// Estado inicial para productos
export const initialProductState = {
  products: [],
  loading: false,
  error: null,
  selectedProduct: null,
  categories: []
}

// Estado inicial para recompensas
export const initialRewardState = {
  rewards: [],
  loading: false,
  error: null,
  selectedReward: null,
  categories: []
}

// Estado inicial para servicios
export const initialServiceState = {
  services: [],
  loading: false,
  error: null,
  selectedService: null,
  categories: []
}

// Estado inicial para usuarios
export const initialUserState = {
  users: [],
  loading: false,
  error: null,
  selectedUser: null
}

// Estado inicial del formulario de producto
export const initialProductForm = {
  name: '',
  description: '',
  price: '',
  points_earned: '',
  category: '',
  image_url: ''
}

// Estado inicial del formulario de recompensa
export const initialRewardForm = {
  name: '',
  description: '',
  points_cost: '',
  category: '',
  image_url: '',
  stock: '',
  is_popular: false
}

// Estado inicial del formulario de servicio
export const initialServiceForm = {
  name: '',
  description: '',
  points_required: '',
  points_earned: '',
  category: '',
  image_url: ''
}

// Categorías predefinidas
export const productCategories = [
  { id: 'Bebidas', name: 'Bebidas', icon: '🍺' },
  { id: 'Cócteles', name: 'Cócteles', icon: '🍹' },
  { id: 'Snacks', name: 'Snacks', icon: '🍿' },
  { id: 'Comida', name: 'Comida', icon: '🍔' },
  { id: 'Promos', name: 'Promos', icon: '🎉' }
]

export const rewardCategories = [
  { id: 'Bebidas', name: 'Bebidas', icon: '🍹' },
  { id: 'Comida', name: 'Comida', icon: '🍕' },
  { id: 'Descuentos', name: 'Descuentos', icon: '💰' },
  { id: 'Experiencias', name: 'Experiencias', icon: '⭐' }
]

export const serviceCategories = [
  { id: 'Reservas', name: 'Reservas', icon: '📅' },
  { id: 'Eventos', name: 'Eventos', icon: '🎉' },
  { id: 'Entretenimiento', name: 'Entretenimiento', icon: '🎤' },
  { id: 'VIP', name: 'VIP', icon: '👑' },
  { id: 'Delivery', name: 'Delivery', icon: '🚗' }
]

// Mensajes del sistema
export const adminMessages = {
  // Productos
  PRODUCT_CREATED: '✅ Producto creado exitosamente',
  PRODUCT_UPDATED: '✅ Producto actualizado exitosamente',
  PRODUCT_DELETED: '✅ Producto eliminado exitosamente',
  PRODUCT_ERROR: '❌ Error al procesar el producto',
  
  // Recompensas
  REWARD_CREATED: '✅ Recompensa creada exitosamente',
  REWARD_UPDATED: '✅ Recompensa actualizada exitosamente',
  REWARD_DELETED: '✅ Recompensa eliminada exitosamente',
  REWARD_ERROR: '❌ Error al procesar la recompensa',
  
  // Servicios
  SERVICE_CREATED: '✅ Servicio creado exitosamente',
  SERVICE_UPDATED: '✅ Servicio actualizado exitosamente',
  SERVICE_DELETED: '✅ Servicio eliminado exitosamente',
  SERVICE_ERROR: '❌ Error al procesar el servicio',
  
  // General
  LOADING: 'Cargando...',
  SAVING: 'Guardando...',
  DELETING: 'Eliminando...',
  CONFIRM_DELETE: '¿Estás seguro de eliminar este elemento?',
  REQUIRED_FIELDS: 'Por favor completa todos los campos requeridos'
}
