/**
 * Auth Model
 * Define la estructura de datos y estados iniciales para autenticación
 */

export const initialAuthState = {
  email: '',
  password: ''
}

export const initialStatusState = {
  loading: false,
  error: null,
  success: false
}

export const statusMessages = {
  SUCCESS: 'Inicio de sesión exitoso!',
  ERROR: 'Credenciales incorrectas',
  LOADING: 'Verificando...',
  NETWORK_ERROR: 'Error de conexión. Intenta nuevamente.'
}