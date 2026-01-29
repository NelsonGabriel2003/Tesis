/**
 * Migration: Crear tablas de pedidos, personal y Telegram
 * Ejecutar con: node database/migrations/002_orders_telegram.js
 */

import 'dotenv/config'
import { pool } from '../../src/config/database.js'

const crearTablasPedidos = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Iniciando migracion de pedidos y Telegram...\n')

    // ===================
    // TABLA: personal (sin fechas - historial las registra)
    // ===================
    console.log('Creando tabla personal...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS personal (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        correo VARCHAR(255),
        telegram_chat_id VARCHAR(50) UNIQUE,
        telegram_username VARCHAR(100),
        rol VARCHAR(50) DEFAULT 'mesero',
        puede_aprobar_pedidos BOOLEAN DEFAULT true,
        puede_completar_pedidos BOOLEAN DEFAULT true,
        activo BOOLEAN DEFAULT true,
        en_turno BOOLEAN DEFAULT false,
        ultima_actividad TIMESTAMP
      )
    `)

    // ===================
    // TABLA: pedidos (con fechas - son estados del flujo)
    // ===================
    console.log('Creando tabla pedidos...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        personal_id INTEGER REFERENCES personal(id) ON DELETE SET NULL,
        codigo_pedido VARCHAR(20) UNIQUE NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente',
        subtotal DECIMAL(10, 2) NOT NULL,
        descuento DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        puntos_a_ganar INTEGER DEFAULT 0,
        puntos_ganados INTEGER DEFAULT 0,
        puntos_usados INTEGER DEFAULT 0,
        numero_mesa VARCHAR(10),
        notas TEXT,
        motivo_rechazo TEXT,
        datos_qr TEXT,
        telegram_mensaje_id VARCHAR(50),
        fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_aprobacion TIMESTAMP,
        fecha_preparacion TIMESTAMP,
        fecha_completado TIMESTAMP,
        fecha_entrega TIMESTAMP
      )
    `)

    // ===================
    // TABLA: items_pedido (con fecha - dato del pedido)
    // ===================
    console.log('Creando tabla items_pedido...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS items_pedido (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
        producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
        nombre_producto VARCHAR(255) NOT NULL,
        precio_producto DECIMAL(10, 2) NOT NULL,
        puntos_por_item INTEGER NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 1,
        total_item DECIMAL(10, 2) NOT NULL,
        puntos_total INTEGER NOT NULL,
        instrucciones_especiales TEXT,
        fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ===================
    // TABLA: notificaciones (con fechas - tracking de envios)
    // ===================
    console.log('Creando tabla notificaciones...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        personal_id INTEGER REFERENCES personal(id) ON DELETE CASCADE,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
        tipo VARCHAR(50) NOT NULL,
        canal VARCHAR(20) NOT NULL,
        titulo VARCHAR(255),
        mensaje TEXT NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_envio TIMESTAMP,
        fecha_entrega TIMESTAMP,
        mensaje_error TEXT,
        metadatos TEXT
      )
    `)

    // ===================
    // TABLA: sesiones_telegram (sin fechas - historial las registra)
    // ===================
    console.log('Creando tabla sesiones_telegram...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS sesiones_telegram (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(50) UNIQUE NOT NULL,
        telegram_usuario_id VARCHAR(50),
        username VARCHAR(100),
        nombre VARCHAR(100),
        personal_id INTEGER REFERENCES personal(id) ON DELETE CASCADE,
        autenticado BOOLEAN DEFAULT false,
        codigo_vinculacion VARCHAR(20),
        codigo_vinculacion_expira TIMESTAMP,
        ultimo_comando VARCHAR(100),
        contexto TEXT
      )
    `)

    // ===================
    // INDICES
    // ===================
    console.log('Creando indices...')
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pedidos_codigo ON pedidos(codigo_pedido)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_items_pedido ON items_pedido(pedido_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_personal_telegram ON personal(telegram_chat_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_personal_turno ON personal(activo, en_turno)`)

    await client.query('COMMIT')
    console.log('\nMigracion completada!')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

crearTablasPedidos()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default crearTablasPedidos
