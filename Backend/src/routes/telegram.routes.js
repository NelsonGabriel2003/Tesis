/**
 * Telegram Routes
 * Endpoints para el webhook de Telegram Bot
 */

import { Router } from 'express'
import telegramService from '../services/telegram.service.js'

const router = Router()

/**
 * POST /api/telegram/webhook
 * Endpoint que recibe los updates de Telegram
 * Este endpoint es llamado por los servidores de Telegram cuando hay nuevos mensajes
 */
router.post('/webhook', (req, res) => {
  try {
    // Procesar el update recibido
    telegramService.processUpdate(req.body)

    // Telegram espera un 200 OK
    res.sendStatus(200)
  } catch (error) {
    console.error('❌ Error procesando webhook:', error.message)
    // Siempre responder 200 para evitar reintentos de Telegram
    res.sendStatus(200)
  }
})

/**
 * GET /api/telegram/status
 * Endpoint para verificar el estado del bot
 */
router.get('/status', async (req, res) => {
  try {
    if (!telegramService.isInitialized) {
      return res.json({
        success: false,
        message: 'Bot no inicializado',
        mode: null
      })
    }

    const webhookInfo = telegramService.useWebhook
      ? await telegramService.bot.getWebHookInfo()
      : null

    res.json({
      success: true,
      message: 'Bot activo',
      mode: telegramService.useWebhook ? 'webhook' : 'polling',
      webhook: webhookInfo ? {
        url: webhookInfo.url,
        pending_updates: webhookInfo.pending_update_count,
        last_error: webhookInfo.last_error_message || null
      } : null
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado',
      error: error.message
    })
  }
})

/**
 * POST /api/telegram/setup-webhook
 * Endpoint para configurar/actualizar el webhook manualmente
 * Solo para administradores
 */
router.post('/setup-webhook', async (req, res) => {
  try {
    await telegramService.setupWebhook()

    const info = await telegramService.bot.getWebHookInfo()

    res.json({
      success: true,
      message: 'Webhook configurado',
      webhook: {
        url: info.url,
        pending_updates: info.pending_update_count
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error configurando webhook',
      error: error.message
    })
  }
})

/**
 * DELETE /api/telegram/webhook
 * Endpoint para eliminar el webhook (cambiar a polling)
 */
router.delete('/webhook', async (req, res) => {
  try {
    await telegramService.removeWebhook()

    res.json({
      success: true,
      message: 'Webhook eliminado'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando webhook',
      error: error.message
    })
  }
})

export default router
