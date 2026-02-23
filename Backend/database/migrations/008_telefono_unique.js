import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const agregarTelefonoUnico = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Iniciando migracion de telefono unico...\n')

    console.log('Agregando restriccion UNIQUE al campo telefono...')
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_telefono_unico
      ON usuarios(telefono)
      WHERE telefono IS NOT NULL
    `)

    await client.query('COMMIT')

    console.log('\nMigracion completada exitosamente!')
    console.log('Indice unico creado: idx_usuarios_telefono_unico (permite NULL)')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en la migracion:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

agregarTelefonoUnico()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default agregarTelefonoUnico
