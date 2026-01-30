/**
 * Migration: Limpieza segura de tablas antiguas
 * Ejecutar con: node database/migrations/009_safe_cleanup.js
 *
 * Este script:
 * 1. Verifica si existen tablas antiguas (inglés)
 * 2. Cuenta los registros en cada una
 * 3. Si hay datos, los migra a las tablas nuevas (español)
 * 4. Elimina las tablas antiguas solo si están vacías o ya se migraron
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const limpiezaSegura = async () => {
  const client = await pool.connect()

  try {
    console.log('========================================')
    console.log('LIMPIEZA SEGURA DE TABLAS ANTIGUAS')
    console.log('========================================\n')

    // Mapeo de tablas inglés -> español
    const mapeoTablas = {
      'users': 'usuarios',
      'products': 'productos',
      'rewards': 'recompensas',
      'services': 'servicios',
      'orders': 'pedidos',
      'order_items': 'items_pedido',
      'redemptions': 'canjes',
      'point_transactions': 'movimientos_puntos',
      'transactions': 'movimientos_puntos',
      'staff': 'personal',
      'telegram_sessions': 'sesiones_telegram',
      'notifications': 'notificaciones',
      'config': 'configuracion_negocio',
      'configurations': 'configuracion_negocio',
      'business_config': 'configuracion_negocio',
      'photos': 'fotos'
    }

    // Tablas a eliminar en orden (respetando foreign keys)
    const tablasOrden = [
      'order_items',
      'orders',
      'redemptions',
      'point_transactions',
      'transactions',
      'telegram_sessions',
      'notifications',
      'notifications_old',
      'staff',
      'photos',
      'photos_old',
      'products',
      'rewards',
      'services',
      'config',
      'configurations',
      'business_config',
      'users'
    ]

    // =====================
    // FASE 1: Diagnóstico
    // =====================
    console.log('FASE 1: Diagnosticando tablas antiguas...\n')

    const tablasConDatos = []
    const tablasVacias = []
    const tablasNoExisten = []

    for (const tabla of tablasOrden) {
      const existe = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        )
      `, [tabla])

      if (existe.rows[0].exists) {
        const conteo = await client.query(`SELECT COUNT(*) as total FROM ${tabla}`)
        const total = parseInt(conteo.rows[0].total)

        if (total > 0) {
          tablasConDatos.push({ nombre: tabla, registros: total })
          console.log(`  ⚠ ${tabla}: ${total} registros`)
        } else {
          tablasVacias.push(tabla)
          console.log(`  ✓ ${tabla}: vacía`)
        }
      } else {
        tablasNoExisten.push(tabla)
      }
    }

    console.log(`\n  Tablas no encontradas: ${tablasNoExisten.length}`)

    // =====================
    // FASE 2: Migración de datos (si hay)
    // =====================
    if (tablasConDatos.length > 0) {
      console.log('\n========================================')
      console.log('FASE 2: Migrando datos...')
      console.log('========================================\n')

      await client.query('BEGIN')

      for (const { nombre, registros } of tablasConDatos) {
        const tablaDestino = mapeoTablas[nombre]

        if (!tablaDestino) {
          console.log(`  ⏭ ${nombre}: Sin tabla destino, se eliminará directamente`)
          continue
        }

        try {
          // Verificar si la tabla destino existe
          const destinoExiste = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables
              WHERE table_schema = 'public'
              AND table_name = $1
            )
          `, [tablaDestino])

          if (!destinoExiste.rows[0].exists) {
            console.log(`  ⚠ ${nombre} -> ${tablaDestino}: Destino no existe, omitiendo migración`)
            continue
          }

          // Migrar según el tipo de tabla
          await migrarDatos(client, nombre, tablaDestino)
          console.log(`  ✓ ${nombre} -> ${tablaDestino}: ${registros} registros migrados`)

        } catch (err) {
          console.log(`  ✗ ${nombre}: Error al migrar - ${err.message}`)
        }
      }

      await client.query('COMMIT')
    } else {
      console.log('\n✓ No hay datos que migrar')
    }

    // =====================
    // FASE 3: Eliminación de tablas
    // =====================
    console.log('\n========================================')
    console.log('FASE 3: Eliminando tablas antiguas...')
    console.log('========================================\n')

    await client.query('BEGIN')

    for (const tabla of tablasOrden) {
      try {
        const existe = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          )
        `, [tabla])

        if (existe.rows[0].exists) {
          await client.query(`DROP TABLE IF EXISTS ${tabla} CASCADE`)
          console.log(`  ✓ ${tabla} eliminada`)
        }
      } catch (err) {
        console.log(`  ✗ ${tabla}: ${err.message}`)
      }
    }

    await client.query('COMMIT')

    // =====================
    // RESUMEN FINAL
    // =====================
    console.log('\n========================================')
    console.log('LIMPIEZA COMPLETADA')
    console.log('========================================')
    console.log('\nTablas del sistema (español):')
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
    console.error('\n✗ Error en limpieza:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

/**
 * Migrar datos de tabla origen a destino
 * Nota: Solo migra si no hay conflictos de ID
 */
async function migrarDatos(client, origen, destino) {
  // Obtener columnas comunes entre origen y destino
  const columnasOrigen = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
  `, [origen])

  const columnasDestino = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
  `, [destino])

  const colsOrigen = columnasOrigen.rows.map(r => r.column_name)
  const colsDestino = columnasDestino.rows.map(r => r.column_name)

  // Encontrar columnas comunes (excepto id para evitar conflictos)
  const columnasComunes = colsOrigen.filter(col =>
    colsDestino.includes(col) && col !== 'id'
  )

  if (columnasComunes.length === 0) {
    throw new Error('No hay columnas comunes para migrar')
  }

  // Verificar si hay registros duplicados potenciales
  const countDestino = await client.query(`SELECT COUNT(*) FROM ${destino}`)
  if (parseInt(countDestino.rows[0].count) > 0) {
    // Ya hay datos en destino, no migrar para evitar duplicados
    console.log(`    (${destino} ya tiene datos, omitiendo para evitar duplicados)`)
    return
  }

  // Insertar datos
  const cols = columnasComunes.join(', ')
  await client.query(`
    INSERT INTO ${destino} (${cols})
    SELECT ${cols} FROM ${origen}
    ON CONFLICT DO NOTHING
  `)
}

limpiezaSegura()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default limpiezaSegura
