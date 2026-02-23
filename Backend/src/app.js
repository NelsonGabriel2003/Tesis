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
import UsuarioModel from './models/usuario.model.js'
import MovimientoModel from './models/movimiento.model.js'
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

  // --- Reinicio mensual de puntos ---
  let ultimoMesReiniciado = null

  setInterval(async () => {
    const ahora = new Date()
    const mesActual = `${ahora.getFullYear()}-${ahora.getMonth()}`

    if (ahora.getDate() === 1 && ultimoMesReiniciado !== mesActual) {
      try {
        const afectados = await UsuarioModel.reiniciarPuntosActualesMensual()

        for (const usuario of afectados) {
          if (usuario.puntos_actuales > 0) {
            await MovimientoModel.crear({
              usuario_id: usuario.id,
              tipo: 'expirado',
              puntos: usuario.puntos_actuales,
              descripcion: `Reinicio mensual de puntos - ${ahora.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })}`,
              tipo_referencia: 'sistema',
              referencia_id: null
            })
          }
        }

        ultimoMesReiniciado = mesActual
        console.log(`Reinicio mensual: ${afectados.length} usuario(s) con puntos expirados`)
      } catch (error) {
        console.error('Error en reinicio mensual:', error.message)
      }
    }
  }, 60000)

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
