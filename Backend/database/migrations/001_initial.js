/**
 * Migration: Crear tablas principales del sistema
 * Ejecutar con: node database/migrations/001_initial.js
 *
 * Nota: Las tablas maestras no tienen campos de fecha porque
 * el historial se encarga de registrar todos los cambios
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const crearTablasIniciales = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Iniciando migracion de tablas principales...\n')

    // ===================
    // TABLA: usuarios (sin fechas - historial las registra)
    // ===================
    console.log('Creando tabla usuarios...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        correo VARCHAR(255) UNIQUE NOT NULL,
        contrasena VARCHAR(255) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        rol VARCHAR(20) DEFAULT 'usuario',
        nivel_membresia VARCHAR(20) DEFAULT 'bronce',
        puntos_actuales INTEGER DEFAULT 0,
        puntos_totales INTEGER DEFAULT 0
      )
    `)

    // ===================
    // TABLA: productos (sin fechas - historial las registra)
    // ===================
    console.log('Creando tabla productos...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        puntos_otorgados INTEGER DEFAULT 0,
        categoria VARCHAR(100) NOT NULL,
        imagen_url VARCHAR(500),
        disponible BOOLEAN DEFAULT true
      )
    `)

    // ===================
    // TABLA: recompensas (sin fechas - historial las registra)
    // ===================
    console.log('Creando tabla recompensas...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS recompensas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        puntos_requeridos INTEGER NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        imagen_url VARCHAR(500),
        stock INTEGER DEFAULT 100,
        es_popular BOOLEAN DEFAULT false,
        disponible BOOLEAN DEFAULT true
      )
    `)

    // ===================
    // TABLA: servicios (sin fechas - historial las registra)
    // ===================
    console.log('Creando tabla servicios...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS servicios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        puntos_requeridos INTEGER DEFAULT 0,
        puntos_otorgados INTEGER DEFAULT 0,
        categoria VARCHAR(100) NOT NULL,
        imagen_url VARCHAR(500),
        disponible BOOLEAN DEFAULT true
      )
    `)

    // ===================
    // TABLA: movimientos_puntos (con fecha - es dato del negocio)
    // ===================
    console.log('Creando tabla movimientos_puntos...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS movimientos_puntos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        tipo VARCHAR(20) NOT NULL,
        puntos INTEGER NOT NULL,
        descripcion TEXT,
        tipo_referencia VARCHAR(50),
        referencia_id INTEGER,
        fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ===================
    // TABLA: canjes (con fechas - son datos del ciclo de vida)
    // ===================
    console.log('Creando tabla canjes...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS canjes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        recompensa_id INTEGER REFERENCES recompensas(id),
        puntos_gastados INTEGER NOT NULL,
        codigo_canje VARCHAR(20) UNIQUE NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente',
        fecha_canje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_uso TIMESTAMP
      )
    `)

    // ===================
    // INDICES
    // ===================
    console.log('Creando indices...')

    await client.query(`CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_recompensas_categoria ON recompensas(categoria)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON servicios(categoria)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_movimientos_usuario ON movimientos_puntos(usuario_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos_puntos(tipo)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_canjes_usuario ON canjes(usuario_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_canjes_codigo ON canjes(codigo_canje)`)

    await client.query('COMMIT')

    console.log('\nMigracion completada exitosamente!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en la migracion:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

crearTablasIniciales()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default crearTablasIniciales
