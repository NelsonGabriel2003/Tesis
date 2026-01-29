/**
 * Migration: Agregar campos para recuperacion de contrasena
 * Ejecutar con: node database/migrations/006_password_reset.js
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const agregarCamposRecuperacion = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Agregando campos de recuperacion de contrasena...\n')

    await client.query(`
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS codigo_recuperacion VARCHAR(30),
      ADD COLUMN IF NOT EXISTS codigo_recuperacion_expira TIMESTAMP,
      ADD COLUMN IF NOT EXISTS telegram_chat_id VARCHAR(50)
    `)

    console.log('Campos agregados a usuarios')

    await client.query('COMMIT')
    console.log('\nMigracion completada!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

agregarCamposRecuperacion()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default agregarCamposRecuperacion
