import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const addLinkCodeToStaff = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('🚀 Agregando campos de código de vinculación a staff...\n')

    // Agregar columnas link_code y link_code_expires a staff
    await client.query(`
      ALTER TABLE staff
      ADD COLUMN IF NOT EXISTS link_code VARCHAR(10) UNIQUE,
      ADD COLUMN IF NOT EXISTS link_code_expires TIMESTAMP
    `)

    console.log('✅ Columnas agregadas a staff')

    // Crear índice para búsqueda rápida por código
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_staff_link_code ON staff(link_code)
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

addLinkCodeToStaff()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default addLinkCodeToStaff
