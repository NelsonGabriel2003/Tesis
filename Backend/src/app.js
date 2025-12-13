/**
 * App.js - Entry Point
 * Sistema de Fidelización - Backend API
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')

const routes = require('./routes')
const { notFound, errorHandler } = require('./middlewares')

// Crear aplicación Express
const app = express()

// ===================
// MIDDLEWARES GLOBALES
// ===================

// Habilitar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

// Parsear JSON
app.use(express.json())

// Parsear URL-encoded
app.use(express.urlencoded({ extended: true }))

// Logger simple para desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })
}

// ===================
// RUTAS
// ===================

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🍺 API Sistema de Fidelización',
    version: '1.0.0',
    docs: '/api/health'
  })
})

// Rutas de la API
app.use('/api', routes)

// ===================
// MANEJO DE ERRORES
// ===================

// Ruta no encontrada
app.use(notFound)

// Manejador de errores global
app.use(errorHandler)

// ===================
// INICIAR SERVIDOR
// ===================

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🍺 Sistema de Fidelización - API        ║
  ║                                           ║
  ║   Puerto: ${PORT}                            ║
  ║   Entorno: ${process.env.NODE_ENV || 'development'}                 ║
  ║                                           ║
  ║   Endpoints disponibles:                  ║
  ║   • GET  /api/health                      ║
  ║   • POST /api/auth/login                  ║
  ║   • POST /api/auth/register               ║
  ║   • GET  /api/products                    ║
  ║   • GET  /api/rewards                     ║
  ║   • GET  /api/services                    ║
  ║   • GET  /api/profile                     ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `)
})

module.exports = app
