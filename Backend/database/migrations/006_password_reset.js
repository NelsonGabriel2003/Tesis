/**
 * Migration: Agregar campos para recuperación de contraseña
 * Ejecutar con: node database/migrations/006_password_reset.js
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const agregarCamposReset = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Agregar campos a la tabla users para recuperación de contraseña
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS reset_code VARCHAR(30),
      ADD COLUMN IF NOT EXISTS reset_code_expires TIMESTAMP,
      ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(50)
    `)

    await client.query('COMMIT')

  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

agregarCamposReset()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default agregarCamposReset
