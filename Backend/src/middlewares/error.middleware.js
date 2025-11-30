/**
 * Error Handler Middleware
 * Manejo centralizado de errores
 */

/**
 * Middleware para rutas no encontradas
 */
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

/**
 * Middleware principal de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message)
  
  // Si estamos en desarrollo, mostrar stack trace
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack)
  }

  const statusCode = err.statusCode || 500
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

/**
 * Wrapper para funciones async en controladores
 * Evita tener que usar try-catch en cada controlador
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = {
  notFound,
  errorHandler,
  asyncHandler
}
