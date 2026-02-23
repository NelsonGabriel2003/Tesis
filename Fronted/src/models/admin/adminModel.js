/**
 * Admin Model
 * Estados iniciales y constantes para el módulo administrativo
 */

// Estado inicial para productos
export const initialProductState = {
  products: [],
  totalProducts: 0,
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

// Estado inicial para staff
export const initialStaffState = {
  staff: [],
  loading: false,
  error: null,
  selectedStaff: null
}

// Estado inicial para fotos
export const initialPhotoState = {
  photos: [],
  loading: false,
  error: null,
  selectedPhoto: null
}

// Estado inicial del formulario de foto
export const initialPhotoForm = {
  title: '',
  description: '',
  image_url: '',
  cloudinary_public_id: ''
}

// Estado inicial del formulario de staff
export const initialStaffForm = {
  name: '',
  phone: '',
  email: '',
  role: 'waiter'
}

// Roles del personal
export const staffRoles = [
  { id: 'waiter', name: 'Mesero' },
  { id: 'bartender', name: 'Bartender' },
  { id: 'manager', name: 'Gerente' }
]

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

// Reglas de validación para productos
export const reglasProducto = {
  name: {
    requerido: true,
    min: 2,
    mensajes: {
      requerido: 'El nombre es requerido',
      min: 'El nombre debe tener al menos 2 caracteres'
    }
  },
  price: {
    requerido: true,
    tipo: 'numero',
    mayorQue: 0,
    mensajes: {
      requerido: 'El precio es requerido',
      tipo: 'Ingresa un precio válido',
      mayorQue: 'El precio debe ser mayor a 0'
    }
  },
  points_earned: {
    tipo: 'numero',
    minValor: 0,
    mensajes: {
      tipo: 'Ingresa un número válido',
      minValor: 'Los puntos no pueden ser negativos'
    }
  },
  category: {
    requerido: true,
    mensajes: {
      requerido: 'Selecciona una categoría'
    }
  }
}

// Reglas de validación para recompensas
export const reglasRecompensa = {
  name: {
    requerido: true,
    min: 2,
    mensajes: {
      requerido: 'El nombre es requerido',
      min: 'El nombre debe tener al menos 2 caracteres'
    }
  },
  points_cost: {
    requerido: true,
    tipo: 'numero',
    mayorQue: 0,
    mensajes: {
      requerido: 'El costo en puntos es requerido',
      tipo: 'Ingresa un número válido',
      mayorQue: 'El costo debe ser mayor a 0'
    }
  },
  stock: {
    tipo: 'numero',
    minValor: 0,
    mensajes: {
      tipo: 'Ingresa un número válido',
      minValor: 'El stock no puede ser negativo'
    }
  },
  category: {
    requerido: true,
    mensajes: {
      requerido: 'Selecciona una categoría'
    }
  }
}

// Reglas de validación para configuración
export const reglasConfig = {
  puntos_por_dolar: {
    requerido: true,
    tipo: 'numero',
    mayorQue: 0,
    mensajes: {
      requerido: 'Los puntos por dólar son requeridos',
      tipo: 'Ingresa un número válido',
      mayorQue: 'Debe ser mayor a 0'
    }
  },
  umbral_plata: {
    requerido: true,
    tipo: 'numero',
    mayorQue: 0,
    mensajes: {
      requerido: 'El umbral es requerido',
      tipo: 'Ingresa un número válido',
      mayorQue: 'Debe ser mayor a 0'
    }
  },
  umbral_oro: {
    requerido: true,
    tipo: 'numero',
    mayorQue: 0,
    mensajes: {
      requerido: 'El umbral es requerido',
      tipo: 'Ingresa un número válido',
      mayorQue: 'Debe ser mayor a 0'
    }
  },
  umbral_platino: {
    requerido: true,
    tipo: 'numero',
    mayorQue: 0,
    mensajes: {
      requerido: 'El umbral es requerido',
      tipo: 'Ingresa un número válido',
      mayorQue: 'Debe ser mayor a 0'
    }
  },
  multiplicador_plata: {
    requerido: true,
    tipo: 'numero',
    mayorQue: 0,
    mensajes: {
      requerido: 'El multiplicador es requerido',
      tipo: 'Ingresa un número válido',
      mayorQue: 'Debe ser mayor a 0'
    }
  },
  multiplicador_oro: {
    requerido: true,
    tipo: 'numero',
    mayorQue: 0,
    mensajes: {
      requerido: 'El multiplicador es requerido',
      tipo: 'Ingresa un número válido',
      mayorQue: 'Debe ser mayor a 0'
    }
  },
  multiplicador_platino: {
    requerido: true,
    tipo: 'numero',
    mayorQue: 0,
    mensajes: {
      requerido: 'El multiplicador es requerido',
      tipo: 'Ingresa un número válido',
      mayorQue: 'Debe ser mayor a 0'
    }
  }
}

// Reglas de validación para servicios
export const reglasServicio = {
  name: {
    requerido: true,
    min: 2,
    mensajes: {
      requerido: 'El nombre es requerido',
      min: 'El nombre debe tener al menos 2 caracteres'
    }
  },
  category: {
    requerido: true,
    mensajes: {
      requerido: 'Selecciona una categoría'
    }
  }
}

// Mensajes del sistema
export const adminMessages = {
  // Productos
  PRODUCT_CREATED: 'Producto creado exitosamente',
  PRODUCT_UPDATED: 'Producto actualizado exitosamente',
  PRODUCT_DELETED: 'Producto eliminado exitosamente',
  PRODUCT_ERROR: 'Error al procesar el producto',

  // Recompensas
  REWARD_CREATED: 'Recompensa creada exitosamente',
  REWARD_UPDATED: 'Recompensa actualizada exitosamente',
  REWARD_DELETED: 'Recompensa eliminada exitosamente',
  REWARD_ERROR: 'Error al procesar la recompensa',

  // Servicios
  SERVICE_CREATED: 'Servicio creado exitosamente',
  SERVICE_UPDATED: 'Servicio actualizado exitosamente',
  SERVICE_DELETED: 'Servicio eliminado exitosamente',
  SERVICE_ERROR: 'Error al procesar el servicio',

  // Staff
  STAFF_CREATED: 'Personal creado exitosamente',
  STAFF_UPDATED: 'Personal actualizado exitosamente',
  STAFF_DELETED: 'Personal eliminado exitosamente',
  STAFF_ERROR: 'Error al procesar el personal',
  STAFF_CODE_GENERATED: 'Codigo de vinculacion generado',
  STAFF_UNLINKED: 'Telegram desvinculado correctamente',

  // Fotos
  PHOTO_CREATED: 'Foto creada exitosamente',
  PHOTO_UPDATED: 'Foto actualizada exitosamente',
  PHOTO_DELETED: 'Foto eliminada exitosamente',
  PHOTO_ERROR: 'Error al procesar la foto',

  // General
  LOADING: 'Cargando...',
  SAVING: 'Guardando...',
  DELETING: 'Eliminando...',
  CONFIRM_DELETE: '¿Estas seguro de eliminar este elemento?',
  REQUIRED_FIELDS: 'Por favor completa todos los campos requeridos'
}
