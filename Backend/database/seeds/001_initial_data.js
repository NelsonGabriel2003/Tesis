/**
 * Seed: Datos iniciales del sistema
 * Ejecutar con: node database/seeds/001_initial_data.js
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { pool } from '../../src/config/database.js'

const insertarDatosIniciales = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('Insertando datos iniciales...\n')

    // ===================
    // USUARIOS DE PRUEBA
    // ===================
    console.log('Creando usuarios de prueba...')
    const contrasenaHash = await bcrypt.hash('123456', 10)

    await client.query(`
      INSERT INTO usuarios (correo, contrasena, nombre, telefono, rol, nivel_membresia, puntos_actuales, puntos_totales)
      VALUES
        ('admin@bar.com', $1, 'Administrador', '0999999999', 'admin', 'platino', 5000, 10000),
        ('juan@email.com', $1, 'Juan Perez', '0998765432', 'usuario', 'oro', 1250, 3500),
        ('maria@email.com', $1, 'Maria Garcia', '0991234567', 'usuario', 'plata', 350, 750)
      ON CONFLICT (correo) DO NOTHING
    `, [contrasenaHash])

    // ===================
    // PRODUCTOS
    // ===================
    console.log('Insertando productos...')
    await client.query(`
      INSERT INTO productos (nombre, descripcion, precio, puntos_otorgados, categoria, imagen_url)
      VALUES
        ('Cerveza Nacional', 'Cerveza fria de 330ml', 3.50, 10, 'Bebidas', '/images/cerveza.jpg'),
        ('Cerveza Importada', 'Cerveza premium importada', 5.50, 15, 'Bebidas', '/images/cerveza-imp.jpg'),
        ('Mojito Clasico', 'Ron, menta, limon y soda', 7.00, 20, 'Cocteles', '/images/mojito.jpg'),
        ('Pina Colada', 'Ron, crema de coco y pina', 8.00, 22, 'Cocteles', '/images/pina-colada.jpg'),
        ('Margarita', 'Tequila, triple sec y limon', 8.50, 25, 'Cocteles', '/images/margarita.jpg'),
        ('Cuba Libre', 'Ron, coca cola y limon', 6.00, 18, 'Cocteles', '/images/cuba-libre.jpg'),
        ('Nachos con Queso', 'Nachos crujientes con queso fundido', 6.50, 15, 'Snacks', '/images/nachos.jpg'),
        ('Alitas BBQ', 'Porcion de 8 alitas en salsa BBQ', 9.00, 25, 'Snacks', '/images/alitas.jpg'),
        ('Hamburguesa Clasica', 'Carne, queso, lechuga y tomate', 8.50, 25, 'Comida', 'images/hamburguesa.jpg'),
        ('Tabla de Picadas', 'Seleccion de embutidos y quesos', 14.00, 35, 'Promos', '/images/tabla.jpg'),
        ('Combo Cerveza + Nachos', '2 cervezas + nachos con queso', 10.00, 30, 'Promos', '/images/combo.jpg'),
        ('Shot de Tequila', 'Shot de tequila premium', 4.00, 12, 'Bebidas', '/images/tequila.jpg')
      ON CONFLICT DO NOTHING
    `)

    // ===================
    // RECOMPENSAS
    // ===================
    console.log('Insertando recompensas...')
    await client.query(`
      INSERT INTO recompensas (nombre, descripcion, puntos_requeridos, categoria, stock, es_popular, imagen_url)
      VALUES
        ('Cerveza Gratis', 'Una cerveza nacional de cortesia', 100, 'Bebidas', 50, true, '/images/reward-cerveza.jpg'),
        ('Coctel Premium', 'Un coctel de la casa gratis', 200, 'Bebidas', 30, true, '/images/reward-coctel.jpg'),
        ('Nachos con Todo', 'Porcion de nachos completos', 150, 'Comida', 40, false, '/images/reward-nachos.jpg'),
        ('Alitas x6', '6 alitas en la salsa que prefieras', 180, 'Comida', 35, true, '/images/reward-alitas.jpg'),
        ('10% Descuento', '10% de descuento en tu cuenta', 250, 'Descuentos', 100, false, '/images/reward-10.jpg'),
        ('25% Descuento', '25% de descuento en tu cuenta', 500, 'Descuentos', 50, true, '/images/reward-25.jpg'),
        ('Mesa VIP 1 hora', 'Acceso a zona VIP por 1 hora', 800, 'Experiencias', 20, false, '/images/reward-vip.jpg'),
        ('Fiesta Cumpleanos', 'Decoracion + postre + brindis', 1500, 'Experiencias', 10, true, '/images/reward-cumple.jpg'),
        ('Tabla de Cortesia', 'Tabla de picadas gratis', 400, 'Comida', 25, false, '/images/reward-tabla.jpg'),
        ('Botella de Vino', 'Botella de vino de la casa', 600, 'Bebidas', 20, false, '/images/reward-vino.jpg')
      ON CONFLICT DO NOTHING
    `)

    // ===================
    // SERVICIOS
    // ===================
    console.log('Insertando servicios...')
    await client.query(`
      INSERT INTO servicios (nombre, descripcion, puntos_requeridos, puntos_otorgados, categoria, imagen_url)
      VALUES
        ('Reserva de Mesa', 'Reserva tu mesa con anticipacion', 0, 50, 'Reservas', '/images/serv-mesa.jpg'),
        ('Cumpleanos VIP', 'Paquete especial para cumpleanos', 500, 100, 'Eventos', '/images/serv-cumple.jpg'),
        ('Karaoke Privado', 'Sala privada de karaoke por 2 horas', 300, 75, 'Entretenimiento', '/images/serv-karaoke.jpg'),
        ('DJ Request', 'Pide tu cancion favorita al DJ', 50, 10, 'Entretenimiento', '/images/serv-dj.jpg'),
        ('Area VIP', 'Acceso exclusivo a zona VIP', 1000, 200, 'VIP', '/images/serv-vip.jpg'),
        ('Delivery', 'Envio a domicilio de tu pedido', 0, 25, 'Delivery', '/images/serv-delivery.jpg'),
        ('Clase de Cocteleria', 'Aprende a hacer cocteles', 200, 100, 'Eventos', '/images/serv-clase.jpg'),
        ('Estacionamiento VIP', 'Estacionamiento preferencial', 150, 30, 'VIP', '/images/serv-parking.jpg')
      ON CONFLICT DO NOTHING
    `)

    // ===================
    // MOVIMIENTOS DE PUNTOS DE EJEMPLO
    // ===================
    console.log('Insertando movimientos de puntos de ejemplo...')
    await client.query(`
      INSERT INTO movimientos_puntos (usuario_id, tipo, puntos, descripcion, tipo_referencia)
      VALUES
        (2, 'ganado', 150, 'Compra en el bar', 'pedido'),
        (2, 'ganado', 200, 'Compra en el bar', 'pedido'),
        (2, 'ganado', 100, 'Bonus de bienvenida', 'promocion'),
        (2, 'canjeado', 100, 'Canje: Cerveza Gratis', 'canje'),
        (2, 'ganado', 50, 'Reserva de mesa', 'servicio'),
        (3, 'ganado', 100, 'Compra en el bar', 'pedido'),
        (3, 'ganado', 75, 'Compra en el bar', 'pedido')
      ON CONFLICT DO NOTHING
    `)

    await client.query('COMMIT')

    console.log('\nDatos iniciales insertados exitosamente!')
    console.log('\nUsuarios de prueba:')
    console.log('   - admin@bar.com / 123456 (Admin)')
    console.log('   - juan@email.com / 123456 (Usuario Oro)')
    console.log('   - maria@email.com / 123456 (Usuario Plata)')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al insertar datos:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

insertarDatosIniciales()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export default insertarDatosIniciales
