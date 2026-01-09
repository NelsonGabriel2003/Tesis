/**
 * JWT Configuration
 * Configuración para tokens de autenticación
 */

export default {
  secret: process.env.JWT_SECRET || 'tu_super_secreto_cambiar_en_produccion',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}
