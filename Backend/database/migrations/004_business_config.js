/**
 * Migration: Crear tabla de configuracion del negocio
 * Ejecutar con: node database/migrations/004_business_config.js
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const crearConfiguracionNegocio = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Creando tabla de configuracion de negocio...\n')

    // ===================
    // TABLA: configuracion_negocio (sin fechas - historial las registra)
    // ===================
    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracion_negocio (
        id SERIAL PRIMARY KEY,
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descripcion VARCHAR(255),
        categoria VARCHAR(50) DEFAULT 'general'
      )`
    )
    console.log('Tabla configuracion_negocio creada')

    // ===================
    // INSERTAR CONFIGURACIONES INICIALES
    // ===================
    await client.query(`
      INSERT INTO configuracion_negocio (clave, valor, descripcion, categoria) VALUES
        ('puntos_por_dolar', '1', 'Puntos base por cada $1 gastado', 'puntos'),
        ('umbral_plata', '500', 'Puntos minimos para nivel Plata', 'membresia'),
        ('umbral_oro', '1500', 'Puntos minimos para nivel Oro', 'membresia'),
        ('umbral_platino', '5000', 'Puntos minimos para nivel Platino', 'membresia'),
        ('multiplicador_plata', '1.5', 'Multiplicador para Plata', 'membresia'),
        ('multiplicador_oro', '2', 'Multiplicador para Oro', 'membresia'),
        ('multiplicador_platino', '3', 'Multiplicador para Platino', 'membresia')
      ON CONFLICT (clave) DO NOTHING
    `)
    console.log('Configuraciones insertadas')

    // ===================
    // INDICE
    // ===================
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_configuracion_categoria ON configuracion_negocio(categoria)
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

crearConfiguracionNegocio()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default crearConfiguracionNegocio