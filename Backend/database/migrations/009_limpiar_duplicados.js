/**
 * Migración 009: Limpiar duplicados y agregar UNIQUE constraints
 *
 * Problema: Los seeds se ejecutaban en cada deploy sin verificar duplicados.
 * Esta migración:
 * 1. Remapea foreign keys a los registros originales (MIN id)
 * 2. Elimina registros duplicados
 * 3. Agrega UNIQUE en nombre para evitar futuros duplicados
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const limpiarDuplicados = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    console.log('Limpiando registros duplicados...\n')

    // =====================
    // PRODUCTOS
    // =====================
    const dupProductos = await client.query(`
      SELECT nombre, COUNT(*) as total FROM productos GROUP BY nombre HAVING COUNT(*) > 1
    `)
    console.log(`Productos duplicados encontrados: ${dupProductos.rows.length} nombres`)

    if (dupProductos.rows.length > 0) {
      // Remapear items_pedido al producto original (MIN id)
      await client.query(`
        UPDATE items_pedido ip
        SET producto_id = keeper.min_id
        FROM (
          SELECT nombre, MIN(id) as min_id FROM productos GROUP BY nombre
        ) keeper
        JOIN productos p ON p.nombre = keeper.nombre AND p.id != keeper.min_id
        WHERE ip.producto_id = p.id
      `)

      // Eliminar duplicados (mantener MIN id)
      const delProductos = await client.query(`
        DELETE FROM productos
        WHERE id NOT IN (SELECT MIN(id) FROM productos GROUP BY nombre)
      `)
      console.log(`  Productos eliminados: ${delProductos.rowCount}`)
    }

    // =====================
    // RECOMPENSAS
    // =====================
    const dupRecompensas = await client.query(`
      SELECT nombre, COUNT(*) as total FROM recompensas GROUP BY nombre HAVING COUNT(*) > 1
    `)
    console.log(`Recompensas duplicadas encontradas: ${dupRecompensas.rows.length} nombres`)

    if (dupRecompensas.rows.length > 0) {
      // Remapear canjes a la recompensa original (MIN id)
      await client.query(`
        UPDATE canjes c
        SET recompensa_id = keeper.min_id
        FROM (
          SELECT nombre, MIN(id) as min_id FROM recompensas GROUP BY nombre
        ) keeper
        JOIN recompensas r ON r.nombre = keeper.nombre AND r.id != keeper.min_id
        WHERE c.recompensa_id = r.id
      `)

      // Eliminar duplicados
      const delRecompensas = await client.query(`
        DELETE FROM recompensas
        WHERE id NOT IN (SELECT MIN(id) FROM recompensas GROUP BY nombre)
      `)
      console.log(`  Recompensas eliminadas: ${delRecompensas.rowCount}`)
    }

    // =====================
    // SERVICIOS
    // =====================
    const dupServicios = await client.query(`
      SELECT nombre, COUNT(*) as total FROM servicios GROUP BY nombre HAVING COUNT(*) > 1
    `)
    console.log(`Servicios duplicados encontrados: ${dupServicios.rows.length} nombres`)

    if (dupServicios.rows.length > 0) {
      const delServicios = await client.query(`
        DELETE FROM servicios
        WHERE id NOT IN (SELECT MIN(id) FROM servicios GROUP BY nombre)
      `)
      console.log(`  Servicios eliminados: ${delServicios.rowCount}`)
    }

    // =====================
    // CONFIGURACION WHATSAPP
    // =====================
    console.log('\nInsertando configuracion de WhatsApp...')
    await client.query(`
      INSERT INTO configuracion_negocio (clave, valor, descripcion, categoria)
      VALUES ('whatsapp_reservas', '0958988509', 'Numero de WhatsApp para reservas de servicios', 'contacto')
      ON CONFLICT (clave) DO NOTHING
    `)

    // =====================
    // AGREGAR UNIQUE CONSTRAINTS
    // =====================
    console.log('Agregando constraints UNIQUE en nombre...')

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_productos_nombre_unico ON productos(nombre)
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_recompensas_nombre_unico ON recompensas(nombre)
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_servicios_nombre_unico ON servicios(nombre)
    `)

    await client.query('COMMIT')
    console.log('\nLimpieza completada exitosamente!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en limpieza:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

limpiarDuplicados()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
