/**
 * Seed: Datos de personal del sistema
 * Ejecutar con: node database/seeds/002_orders_data.js
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const insertarDatosPersonal = async () => {
  const client = await pool.connect()

  try {
    console.log('Insertando datos de personal...\n')

    // Verificar si ya hay datos
    const existente = await client.query('SELECT COUNT(*) FROM personal')

    if (parseInt(existente.rows[0].count) > 0) {
      console.log('Ya existen datos en personal. Omitiendo...')
    } else {
      // Insertar personal de ejemplo
      await client.query(`
        INSERT INTO personal (nombre, correo, telefono, rol, puede_aprobar_pedidos, puede_completar_pedidos)
        VALUES
          ('Maria Garcia', 'maria@bar.com', '0991234567', 'mesero', true, true),
          ('Carlos Lopez', 'carlos@bar.com', '0997654321', 'mesero', true, true)
      `)
      console.log('Personal insertado correctamente')
    }

    // Mostrar resultados
    const resultado = await client.query('SELECT id, nombre, correo, rol FROM personal')
    console.log('\nPersonal en la base de datos:')
    resultado.rows.forEach(p => {
      console.log(`   - ${p.nombre} (${p.correo}) - ${p.rol}`)
    })

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

insertarDatosPersonal()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default insertarDatosPersonal
