import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const createBusinessConfig = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('📦 Creando tabla de configuración de negocio...\n')

    // 1. CREAR LA TABLA (esto faltaba)
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_config (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description VARCHAR(255),
        category VARCHAR(50) DEFAULT 'general'
      )`
    )
    console.log(' Tabla business_config creada')

    // 2. INSERTAR CONFIGURACIONES
    await client.query(`
      INSERT INTO business_config (key, value, description, category) VALUES
        ('points_per_dollar', '1', 'Puntos base por cada $1 gastado', 'points'),
        ('threshold_plata', '500', 'Puntos mínimos para nivel Plata', 'membership'),
        ('threshold_oro', '1500', 'Puntos mínimos para nivel Oro', 'membership'),
        ('threshold_platino', '5000', 'Puntos mínimos para nivel Platino', 'membership'),
        ('multiplier_plata', '1.5', 'Multiplicador para Plata', 'membership'),
        ('multiplier_oro', '2', 'Multiplicador para Oro', 'membership'),
        ('multiplier_platino', '3', 'Multiplicador para Platino', 'membership')
      ON CONFLICT (key) DO NOTHING
    `)
    console.log('✅ Configuraciones insertadas')

    // 3. CREAR ÍNDICE
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_business_config_category ON business_config(category)
    `)
    console.log('✅ Índice creado')

    await client.query('COMMIT')
    console.log('\n✅ Migración completada!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error(' Error:', error.message)
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