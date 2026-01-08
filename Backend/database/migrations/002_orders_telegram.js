require('dotenv').config()

const { pool } = require('../../src/config/database')

const createOrderTables = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('🚀 Iniciando migración de pedidos y Telegram...\n')

    console.log('📦 Creando tabla staff...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        telegram_chat_id VARCHAR(50) UNIQUE,
        telegram_username VARCHAR(100),
        role VARCHAR(50) DEFAULT 'waiter',
        can_approve_orders BOOLEAN DEFAULT true,
        can_complete_orders BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        is_on_shift BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP
      )
    `)

    console.log('📦 Creando tabla orders...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
        order_code VARCHAR(20) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        subtotal DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        points_to_earn INTEGER DEFAULT 0,
        points_earned INTEGER DEFAULT 0,
        points_used INTEGER DEFAULT 0,
        table_number VARCHAR(10),
        notes TEXT,
        rejection_reason TEXT,
        qr_code_data TEXT,
        telegram_message_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        preparing_at TIMESTAMP,
        completed_at TIMESTAMP,
        delivered_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('📦 Creando tabla order_items...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255) NOT NULL,
        product_price DECIMAL(10, 2) NOT NULL,
        points_per_item INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        item_total DECIMAL(10, 2) NOT NULL,
        points_total INTEGER NOT NULL,
        special_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('📦 Creando tabla notifications...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL,
        channel VARCHAR(20) NOT NULL,
        title VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        sent_at TIMESTAMP,
        delivered_at TIMESTAMP,
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('📦 Creando tabla telegram_sessions...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS telegram_sessions (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(50) UNIQUE NOT NULL,
        telegram_user_id VARCHAR(50),
        username VARCHAR(100),
        first_name VARCHAR(100),
        staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
        is_authenticated BOOLEAN DEFAULT false,
        link_code VARCHAR(20),
        link_code_expires TIMESTAMP,
        last_command VARCHAR(100),
        context JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('📦 Creando índices...')
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(order_code)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_staff_telegram ON staff(telegram_chat_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_staff_shift ON staff(is_active, is_on_shift)`)

    await client.query('COMMIT')
    console.log('\n✅ Migración completada!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

if (require.main === module) {
  createOrderTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

module.exports = createOrderTables
