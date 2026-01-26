/**
 * Migration: Crear tabla para recuperación de contraseñas
 * Ejecutar con: node database/migrations/006_password_resets.js
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const createPasswordResetsTable = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Creando tabla password_resets...')

    await client.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Índices para búsquedas rápidas
    await client.query(`CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_password_resets_code ON password_resets(code)`)

    await client.query('COMMIT')

    console.log('Tabla password_resets creada exitosamente!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en la migración:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

createPasswordResetsTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default createPasswordResetsTable
