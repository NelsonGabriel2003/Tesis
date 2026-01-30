/**
 * Migration: Eliminar tablas antiguas en ingles
 * Ejecutar con: node database/migrations/008_drop_english_tables.js
 *
 * Este script elimina las tablas que fueron creadas con nombres en ingles
 * antes de la migracion al esquema en espanol
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const eliminarTablasAntiguas = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Iniciando eliminacion de tablas antiguas en ingles...\n')

    // Lista de tablas antiguas en ingles a eliminar
    // El orden es importante por las dependencias (foreign keys)
    const tablasAntiguas = [
      'order_items',
      'orders',
      'redemptions',
      'point_transactions',
      'transactions',
      'telegram_sessions',
      'notifications_old',
      'staff',
      'photos_old',
      'products',
      'rewards',
      'services',
      'config',
      'configurations',
      'business_config',
      'users'
    ]

    for (const tabla of tablasAntiguas) {
      try {
        const resultado = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          )
        `, [tabla])

        if (resultado.rows[0].exists) {
          await client.query(`DROP TABLE IF EXISTS ${tabla} CASCADE`)
          console.log(`  Tabla '${tabla}' eliminada`)
        } else {
          console.log(`  Tabla '${tabla}' no existe, omitiendo...`)
        }
      } catch (err) {
        console.log(`  Error con tabla '${tabla}': ${err.message}`)
      }
    }

    // ===================
    // Corregir referencia en historial si existe
    // ===================
    console.log('\nVerificando referencia en tabla historial...')

    const historialExiste = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'historial'
      )
    `)

    if (historialExiste.rows[0].exists) {
      // Verificar si la FK apunta a 'users' en lugar de 'usuarios'
      const fkInfo = await client.query(`
        SELECT ccu.table_name AS foreign_table
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'historial'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND ccu.column_name = 'id'
      `)

      const tieneReferenciaUsers = fkInfo.rows.some(row => row.foreign_table === 'users')

      if (tieneReferenciaUsers) {
        console.log('  Corrigiendo referencia de users a usuarios...')

        // Eliminar la FK antigua
        await client.query(`
          ALTER TABLE historial
          DROP CONSTRAINT IF EXISTS historial_usuario_id_fkey
        `)

        // Agregar la FK correcta a usuarios
        await client.query(`
          ALTER TABLE historial
          ADD CONSTRAINT historial_usuario_id_fkey
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        `)

        console.log('  Referencia corregida a usuarios')
      } else {
        console.log('  Referencia ya apunta a usuarios, sin cambios necesarios')
      }
    }

    await client.query('COMMIT')

    console.log('\n========================================')
    console.log('Migracion completada exitosamente!')
    console.log('========================================')
    console.log('\nTablas del sistema ahora en espanol:')
    console.log('  - usuarios')
    console.log('  - productos')
    console.log('  - recompensas')
    console.log('  - servicios')
    console.log('  - pedidos')
    console.log('  - items_pedido')
    console.log('  - canjes')
    console.log('  - movimientos_puntos')
    console.log('  - personal')
    console.log('  - sesiones_telegram')
    console.log('  - notificaciones')
    console.log('  - configuracion_negocio')
    console.log('  - fotos')
    console.log('  - historial')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en la migracion:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

eliminarTablasAntiguas()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default eliminarTablasAntiguas
