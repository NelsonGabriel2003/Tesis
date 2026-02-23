/**
 * Notificacion Global Routes
 * Endpoint publico para polling de notificaciones admin → usuario
 */

import { Router } from 'express'
import { pool } from '../config/database.js'

const router = Router()

/**
 * GET /api/notifications/global?since=ISO_DATE
 * Devuelve notificaciones creadas despues de la fecha indicada
 */
router.get('/global', async (req, res) => {
  try {
    const since = req.query.since || new Date(0).toISOString()

    const result = await pool.query(
      `SELECT id, tipo, titulo, mensaje, fecha_creacion
       FROM notificaciones_globales
       WHERE fecha_creacion > $1
       ORDER BY fecha_creacion DESC
       LIMIT 50`,
      [since]
    )

    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error obteniendo notificaciones globales:', error)
    res.status(500).json({ success: false, message: 'Error interno' })
  }
})

export default router
