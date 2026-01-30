/**
 * App.js - Entry Point
 * Sistema de Fidelización - Backend API
 */

import 'dotenv/config'

import express from 'express'
import cors from 'cors'

import routes from './routes/index.js'
import { notFound, errorHandler } from './middlewares/index.js'
import telegramService from './services/telegram.service.js'
import emailService from './services/email.service.js'
import PedidoModel from './models/pedido.model.js'
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
    message: '🍺 API Sistema de Bounty',
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
  telegramService.initialize()
  emailService.inicializar()

  // Auto-cancelar pedidos pendientes cada minuto (después de 6 min sin respuesta)
  const MINUTOS_LIMITE = 6
  const INTERVALO_CHECK = 60000 // 1 minuto

  setInterval(async () => {
    try {
      const cancelados = await PedidoModel.cancelarPendientesExpirados(MINUTOS_LIMITE)
      if (cancelados.length > 0) {
        console.log(`⏰ Auto-cancelados ${cancelados.length} pedido(s) por timeout`)

        // Actualizar mensajes de Telegram para cada pedido cancelado
        for (const pedido of cancelados) {
          if (pedido.telegram_mensaje_id) {
            await telegramService.notificarPedidoExpirado(pedido)
          }
        }
      }
    } catch (error) {
      console.error('Error en auto-cancelación:', error.message)
    }
  }, INTERVALO_CHECK)

  console.log(`

  🍺 Sistema de Bounty - API

   Puerto: ${PORT}
   Entorno: ${process.env.NODE_ENV || 'development'}
   Auto-cancel: ${MINUTOS_LIMITE} min

  ║   Endpoints disponibles:                  ║
  ║   • GET  /api/health                      ║
  ║   • POST /api/auth/login                  ║
  ║   • POST /api/auth/register               ║
  ║   • GET  /api/products                    ║
  ║   • GET  /api/rewards                     ║
  ║   • GET  /api/services                    ║
  ║   • GET  /api/profile                     ║
  ║   • POST /api/transactions               ║
  ║   • GET  /api/transactions
  `)
})

export default app
