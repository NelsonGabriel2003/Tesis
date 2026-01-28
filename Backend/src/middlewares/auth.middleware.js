/**
 * Auth Middleware
 * Verifica tokens JWT y protege rutas
 */

import jwt from 'jsonwebtoken'
import jwtConfig from '../config/jwt.js'

/**
 * Middleware para verificar token JWT
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      })
    }

    const token = authHeader.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      })
    }

    const decoded = jwt.verify(token, jwtConfig.secret)
    req.user = decoded
    
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      })
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    })
  }
}

/**
 * Middleware opcional - no falla si no hay token
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, jwtConfig.secret)
      req.user = decoded
    }
    
    next()
  } catch (error) {
    next()
  }
}

/**
 * Middleware para verificar roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para esta acción'
      })
    }

    next()
  }
}

/**
 * Middleware específico para admin
 */
const isAdmin = requireRole('admin')
export { verifyToken, optionalAuth, requireRole,isAdmin }
