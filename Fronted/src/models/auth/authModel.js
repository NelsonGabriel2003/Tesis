/**
 * Auth Model
 * Define la estructura de datos y estados iniciales para autenticación
 */

// Estado inicial para login
export const initialAuthState = {
  email: '',
  password: ''
}

// Estado inicial para registro
export const initialRegisterState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
}

// Estado de operaciones async
export const initialStatusState = {
  loading: false,
  error: null,
  success: false
}

// Mensajes de estado para login
export const statusMessages = {
  SUCCESS: 'Inicio de sesión exitoso!',
  ERROR: 'Credenciales incorrectas',
  LOADING: 'Verificando...',
  NETWORK_ERROR: 'Error de conexión. Intenta nuevamente.'
}

// Mensajes de estado para registro
export const registerMessages = {
  SUCCESS: '¡Registro exitoso! Bienvenido.',
  ERROR: 'Error al registrar. Intenta nuevamente.',
  EMAIL_EXISTS: 'Este email ya está registrado.',
  PASSWORD_MISMATCH: 'Las contraseñas no coinciden.',
  PASSWORD_SHORT: 'La contraseña debe tener al menos 6 caracteres.',
  INVALID_EMAIL: 'El formato del email no es válido.',
  REQUIRED_FIELDS: 'Todos los campos son requeridos.',
  LOADING: 'Registrando...'
}

// Validaciones
export const validations = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10}$/,
  minPasswordLength: 6
}