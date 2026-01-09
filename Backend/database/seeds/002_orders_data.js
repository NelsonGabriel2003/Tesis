import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const seedOrdersData = async () => {
  const client = await pool.connect()

  try {
    console.log('🌱 Insertando datos de staff...\n')

    // Verificar si ya hay datos
    const existing = await client.query('SELECT COUNT(*) FROM staff')

    if (parseInt(existing.rows[0].count) > 0) {
      console.log('⚠️ Ya existen datos en staff. Omitiendo...')
    } else {
      // Insertar staff de ejemplo
      await client.query(`
        INSERT INTO staff (name, email, phone, role, can_approve_orders, can_complete_orders)
        VALUES
          ('María García', 'maria@bar.com', '0991234567', 'waiter', true, true),
          ('Carlos López', 'carlos@bar.com', '0997654321', 'waiter', true, true)
      `)
      console.log('✅ Staff insertado correctamente')
    }

    // Mostrar resultados
    const result = await client.query('SELECT id, name, email, role FROM staff')
    console.log('\n📋 Staff en la base de datos:')
    result.rows.forEach(s => {
      console.log(`   - ${s.name} (${s.email}) - ${s.role}`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

seedOrdersData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default seedOrdersData
