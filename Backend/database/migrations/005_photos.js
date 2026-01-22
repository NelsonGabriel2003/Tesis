/**
 * Migration: Crear tabla de fotos/eventos
 * Ejecutar con: node database/migrations/005_photos.js
 *
 * Las imagenes se almacenan en Cloudinary, aqui solo guardamos la referencia
 */
import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const createPhotosTable = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('🚀 Iniciando migración de fotos...\n')

    // ===================
    // TABLA: photos
    // ===================
    console.log('📦 Creando tabla photos...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        cloudinary_public_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true
      )
    `)

    // ===================
    // ÍNDICE
    // ===================
    console.log('📦 Creando índice...')
    await client.query(`CREATE INDEX IF NOT EXISTS idx_photos_active ON photos(is_active)`)

    await client.query('COMMIT')

    console.log('\n✅ Migración de fotos completada exitosamente!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error en la migración:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

createPhotosTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default createPhotosTable
