/**
 * Database Configuration
 * Configuración de conexión a PostgreSQL
 */

import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fidelizacion_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection
pool.on('connect', () => {
  console.log('📦 Conectado a PostgreSQL')
})

// Crear tablas faltantes al iniciar
pool.query(`
  CREATE TABLE IF NOT EXISTS notificaciones_globales (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error('Error creando tabla notificaciones_globales:', err))

pool.on('error', (err) => {
  console.error('❌ Error en PostgreSQL:', err)
  process.exit(-1)
})

export const query = (text, params) => pool.query(text, params)
