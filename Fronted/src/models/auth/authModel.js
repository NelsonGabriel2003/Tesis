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

export const mensajesRegistro = {
  EXITO: '¡Registro exitoso! Bienvenido.',
  ERROR: 'Error al registrar. Intenta nuevamente.',
  CORREO_EXISTE: 'Este email ya está registrado.',
  CONTRASENA_NO_COINCIDE: 'Las contraseñas no coinciden.',
  CONTRASENA_CORTA: 'La contraseña debe tener al menos 6 caracteres.',
  CONTRASENA_DEBIL: 'Debe incluir mayúscula, minúscula, número y carácter especial.',
  CONTRASENA_ESPACIOS: 'La contraseña no puede contener espacios.',
  CORREO_INVALIDO: 'El formato del email no es válido.',
  NOMBRE_INVALIDO: 'El nombre solo puede contener letras y espacios.',
  NOMBRE_CORTO: 'El nombre debe tener al menos 3 caracteres.',
  NOMBRE_INCOMPLETO: 'Ingresa nombre y apellido.',
  TELEFONO_INVALIDO: 'Número inválido. Formato: 09XXXXXXXX.',
  CAMPOS_REQUERIDOS: 'Todos los campos son requeridos.',
  TERMINOS_REQUERIDOS: 'Debes aceptar los términos y condiciones.',
  CARGANDO: 'Registrando...'
}

export const registerMessages = mensajesRegistro

export const limiteCampos = {
  nombre: 255,
  correo: 255,
  telefono: 10,
  contrasena: 100
}

export const validaciones = {
  correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefono: /^09[0-9]{8}$/,
  nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  nombreMinimo: 3,
  fuerzaContrasena: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
  sinEspacios: /^\S+$/,
  largoMinimoContrasena: 6
}

export const validations = validaciones