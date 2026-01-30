/**
 * Migration: Crear tabla de historial (auditoria)
 * Ejecutar con: node database/migrations/007_historial.js
 *
 * Esta tabla registra todos los cambios realizados en el sistema
 * para mantener un historial completo de auditoria
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const crearTablaHistorial = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Iniciando migracion de historial...\n')

    // ===================
    // TABLA: historial
    // ===================
    console.log('Creando tabla historial...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS historial (
        id SERIAL PRIMARY KEY,
        tabla_afectada VARCHAR(50) NOT NULL,
        registro_id INTEGER NOT NULL,
        accion VARCHAR(20) NOT NULL,
        valores_anteriores TEXT,
        valores_nuevos TEXT,
        campos_modificados TEXT,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        direccion_ip VARCHAR(45),
        agente_usuario TEXT,
        descripcion TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ===================
    // INDICES
    // ===================
    console.log('Creando indices para historial...')

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_historial_tabla
      ON historial(tabla_afectada)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_historial_registro
      ON historial(tabla_afectada, registro_id)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_historial_usuario
      ON historial(usuario_id)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_historial_fecha
      ON historial(fecha_creacion)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_historial_accion
      ON historial(accion)
    `)

    await client.query('COMMIT')

    console.log('\nMigracion de historial completada exitosamente!')
    console.log('Tabla creada: historial')
    console.log('Indices creados: 5')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en la migracion:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

crearTablaHistorial()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default crearTablaHistorial
