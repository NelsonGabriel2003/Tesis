/**
 * Migration: Crear tabla de fotos/eventos
 * Ejecutar con: node database/migrations/005_photos.js
 *
 * Las imagenes se almacenan en Cloudinary, aqui solo guardamos la referencia
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const crearTablaFotos = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Iniciando migracion de fotos...\n')

    // ===================
    // TABLA: fotos (sin fechas - historial las registra)
    // ===================
    console.log('Creando tabla fotos...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS fotos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen_url VARCHAR(500) NOT NULL,
        cloudinary_public_id VARCHAR(255),
        activo BOOLEAN DEFAULT true
      )
    `)

    // ===================
    // INDICE
    // ===================
    console.log('Creando indice...')
    await client.query(`CREATE INDEX IF NOT EXISTS idx_fotos_activo ON fotos(activo)`)

    await client.query('COMMIT')

    console.log('\nMigracion de fotos completada exitosamente!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en la migracion:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

crearTablaFotos()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default crearTablaFotos
