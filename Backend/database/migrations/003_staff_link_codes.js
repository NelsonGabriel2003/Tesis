/**
 * Migration: Agregar campos de codigo de vinculacion a personal
 * Ejecutar con: node database/migrations/003_staff_link_codes.js
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const agregarCodigoVinculacion = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Agregando campos de codigo de vinculacion a personal...\n')

    await client.query(`
      ALTER TABLE personal
      ADD COLUMN IF NOT EXISTS codigo_vinculacion VARCHAR(10) UNIQUE,
      ADD COLUMN IF NOT EXISTS codigo_vinculacion_expira TIMESTAMP
    `)

    console.log('Columnas agregadas a personal')

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_personal_codigo_vinculacion ON personal(codigo_vinculacion)
    `)

    console.log('Indice creado')

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

agregarCodigoVinculacion()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default agregarCodigoVinculacion
