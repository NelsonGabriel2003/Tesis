import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const createBusinessConfig = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log(' Creando tabla de configuración de negocio...\n')

    // Crear tabla de configuración
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_config (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description VARCHAR(255),
        category VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Tabla business_config creada')

    // Insertar configuraciones por defecto
    await client.query(`
      INSERT INTO business_config (key, value, description, category) VALUES
        ('points_per_dollar', '1', 'Puntos base por cada $1 gastado', 'points'),
        ('multiplier_bronce', '1', 'Multiplicador de puntos para nivel Bronce', 'membership'),
        ('multiplier_plata', '1.5', 'Multiplicador de puntos para nivel Plata', 'membership'),
        ('multiplier_oro', '2', 'Multiplicador de puntos para nivel Oro', 'membership'),
        ('multiplier_platino', '3', 'Multiplicador de puntos para nivel Platino', 'membership'),
        ('threshold_bronce', '0', 'Puntos mínimos para nivel Bronce', 'membership'),
        ('threshold_plata', '500', 'Puntos mínimos para nivel Plata', 'membership'),
        ('threshold_oro', '1500', 'Puntos mínimos para nivel Oro', 'membership'),
        ('threshold_platino', '5000', 'Puntos mínimos para nivel Platino', 'membership'),
        ('points_expiration_days', '365', 'Días antes de que expiren los puntos', 'points'),
        ('icon_bronce', '🥉', 'Ícono para nivel Bronce', 'membership'),
        ('icon_plata', '🥈', 'Ícono para nivel Plata', 'membership'),
        ('icon_oro', '🥇', 'Ícono para nivel Oro', 'membership'),
        ('icon_platino', '💎', 'Ícono para nivel Platino', 'membership'),
        ('color_bronce', 'bg-amber-600', 'Color para nivel Bronce', 'membership'),
        ('color_plata', 'bg-gray-400', 'Color para nivel Plata', 'membership'),
        ('color_oro', 'bg-yellow-500', 'Color para nivel Oro', 'membership'),
        ('color_platino', 'bg-purple-500', 'Color para nivel Platino', 'membership')
      ON CONFLICT (key) DO NOTHING
    `)

    console.log('✅ Configuraciones por defecto insertadas')

    // Crear índice
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_business_config_category ON business_config(category)
    `)

    console.log('✅ Índice creado')

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

createBusinessConfig()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default createBusinessConfig
