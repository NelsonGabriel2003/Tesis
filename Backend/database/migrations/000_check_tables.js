/**
 * Utilidad: Verificar tablas existentes en la base de datos
 * Ejecutar con: node database/migrations/000_check_tables.js
 *
 * Este script lista todas las tablas existentes y verifica
 * cuales son las antiguas (ingles) y cuales son las nuevas (espanol)
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const verificarTablas = async () => {
  const client = await pool.connect()

  try {
    console.log('Verificando estado de tablas en la base de datos...\n')

    // Obtener todas las tablas del esquema public
    const resultado = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    const tablas = resultado.rows.map(row => row.table_name)

    // Tablas que deben existir (espanol)
    const tablasEspanol = [
      'usuarios',
      'productos',
      'recompensas',
      'servicios',
      'pedidos',
      'items_pedido',
      'canjes',
      'movimientos_puntos',
      'personal',
      'sesiones_telegram',
      'notificaciones',
      'configuracion_negocio',
      'fotos',
      'historial'
    ]

    // Tablas antiguas que deben eliminarse (ingles)
    const tablasIngles = [
      'users',
      'products',
      'rewards',
      'services',
      'orders',
      'order_items',
      'redemptions',
      'point_transactions',
      'transactions',
      'staff',
      'telegram_sessions',
      'notifications',
      'config',
      'configurations',
      'business_config',
      'photos'
    ]

    console.log('========================================')
    console.log('TABLAS EN ESPANOL (Sistema actual)')
    console.log('========================================')
    tablasEspanol.forEach(tabla => {
      const existe = tablas.includes(tabla)
      const estado = existe ? '✓' : '✗'
      console.log(`  ${estado} ${tabla}`)
    })

    console.log('\n========================================')
    console.log('TABLAS EN INGLES (Antiguas - Eliminar)')
    console.log('========================================')
    let tablasAEliminar = 0
    tablasIngles.forEach(tabla => {
      const existe = tablas.includes(tabla)
      if (existe) {
        console.log(`  ⚠ ${tabla} (EXISTE - eliminar)`)
        tablasAEliminar++
      }
    })

    if (tablasAEliminar === 0) {
      console.log('  Ninguna tabla antigua encontrada ✓')
    }

    console.log('\n========================================')
    console.log('OTRAS TABLAS ENCONTRADAS')
    console.log('========================================')
    const otras = tablas.filter(t =>
      !tablasEspanol.includes(t) && !tablasIngles.includes(t)
    )
    if (otras.length > 0) {
      otras.forEach(tabla => console.log(`  ? ${tabla}`))
    } else {
      console.log('  Ninguna')
    }

    console.log('\n========================================')
    console.log('RESUMEN')
    console.log('========================================')
    const tablasEspanolExisten = tablasEspanol.filter(t => tablas.includes(t)).length
    console.log(`  Tablas en espanol: ${tablasEspanolExisten}/${tablasEspanol.length}`)
    console.log(`  Tablas antiguas a eliminar: ${tablasAEliminar}`)
    console.log(`  Otras tablas: ${otras.length}`)

    if (tablasAEliminar > 0) {
      console.log('\n⚠ Ejecuta la migracion 008 para eliminar tablas antiguas:')
      console.log('  node database/migrations/008_drop_english_tables.js')
    }

  } catch (error) {
    console.error('Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

verificarTablas()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default verificarTablas
