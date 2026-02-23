/**
 * Helper para notificaciones globales admin → usuario
 * Fire-and-forget: no bloquea la operación que lo invoca
 */

import { pool } from '../config/database.js'

export const notificarGlobal = (tipo, titulo, mensaje) => {
  pool.query(
    'INSERT INTO notificaciones_globales (tipo, titulo, mensaje) VALUES ($1, $2, $3)',
    [tipo, titulo, mensaje]
  ).catch(err => console.error('Error notificacion global:', err))
}
