/**
 * Migration: Crear todas las tablas
 * Ejecutar con: node database/migrations/001_initial.js
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const createTables = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('🚀 Iniciando migración...\n')

    // ===================
    // TABLA: users
    // ===================
    console.log('📦 Creando tabla users...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'user',
        membership_level VARCHAR(20) DEFAULT 'bronce',
        current_points INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ===================
    // TABLA: products
    // ===================
    console.log('📦 Creando tabla products...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        points_earned INTEGER DEFAULT 0,
        category VARCHAR(100) NOT NULL,
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ===================
    // TABLA: rewards
    // ===================
    console.log('📦 Creando tabla rewards...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        points_cost INTEGER NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url VARCHAR(500),
        stock INTEGER DEFAULT 100,
        is_popular BOOLEAN DEFAULT false,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ===================
    // TABLA: services
    // ===================
    console.log('📦 Creando tabla services...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        points_required INTEGER DEFAULT 0,
        points_earned INTEGER DEFAULT 0,
        category VARCHAR(100) NOT NULL,
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ===================
    // TABLA: transactions
    // ===================
    console.log('📦 Creando tabla transactions...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        points INTEGER NOT NULL,
        description TEXT,
        reference_type VARCHAR(50),
        reference_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ===================
    // TABLA: redemptions
    // ===================
    console.log('📦 Creando tabla redemptions...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS redemptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reward_id INTEGER REFERENCES rewards(id),
        points_spent INTEGER NOT NULL,
        redemption_code VARCHAR(20) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP
      )
    `)

    // ===================
    // ÍNDICES
    // ===================
    console.log('📦 Creando índices...')

    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rewards_category ON rewards(category)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemptions(user_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_redemptions_code ON redemptions(redemption_code)`)

    await client.query('COMMIT')

    console.log('\n✅ Migración completada exitosamente!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error en la migración:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

createTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default createTables
