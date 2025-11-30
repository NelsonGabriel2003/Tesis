/**
 * Seed: Datos iniciales
 * Ejecutar con: node database/seeds/001_initial_data.js
 */
require('dotenv').config()

const bcrypt = require('bcryptjs')
const { pool } = require('../../src/config/database')

const seedData = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    console.log('🌱 Insertando datos iniciales...\n')

    // ===================
    // USUARIO DE PRUEBA
    // ===================
    console.log('👤 Creando usuario de prueba...')
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    await client.query(`
      INSERT INTO users (email, password, name, phone, role, membership_level, current_points, total_points)
      VALUES 
        ('admin@bar.com', $1, 'Administrador', '0999999999', 'admin', 'platino', 5000, 10000),
        ('juan@email.com', $1, 'Juan Pérez', '0998765432', 'user', 'oro', 1250, 3500),
        ('maria@email.com', $1, 'María García', '0991234567', 'user', 'plata', 350, 750)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword])

    // ===================
    // PRODUCTOS
    // ===================
    console.log('🍺 Insertando productos...')
    await client.query(`
      INSERT INTO products (name, description, price, points_earned, category, image_url)
      VALUES 
        ('Cerveza Nacional', 'Cerveza fría de 330ml', 3.50, 10, 'Bebidas', '/images/cerveza.jpg'),
        ('Cerveza Importada', 'Cerveza premium importada', 5.50, 15, 'Bebidas', '/images/cerveza-imp.jpg'),
        ('Mojito Clásico', 'Ron, menta, limón y soda', 7.00, 20, 'Cócteles', '/images/mojito.jpg'),
        ('Piña Colada', 'Ron, crema de coco y piña', 8.00, 22, 'Cócteles', '/images/pina-colada.jpg'),
        ('Margarita', 'Tequila, triple sec y limón', 8.50, 25, 'Cócteles', '/images/margarita.jpg'),
        ('Cuba Libre', 'Ron, coca cola y limón', 6.00, 18, 'Cócteles', '/images/cuba-libre.jpg'),
        ('Nachos con Queso', 'Nachos crujientes con queso fundido', 6.50, 15, 'Snacks', '/images/nachos.jpg'),
        ('Alitas BBQ', 'Porción de 8 alitas en salsa BBQ', 9.00, 25, 'Snacks', '/images/alitas.jpg'),
        ('Hamburguesa Clásica', 'Carne, queso, lechuga y tomate', 8.50, 25, 'Comida', 'images/hamburguesa.jpg'),
        ('Tabla de Picadas', 'Selección de embutidos y quesos', 14.00, 35, 'Promos', '/images/tabla.jpg'),
        ('Combo Cerveza + Nachos', '2 cervezas + nachos con queso', 10.00, 30, 'Promos', '/images/combo.jpg'),
        ('Shot de Tequila', 'Shot de tequila premium', 4.00, 12, 'Bebidas', '/images/tequila.jpg')
      ON CONFLICT DO NOTHING
    `)

    // ===================
    // RECOMPENSAS
    // ===================
    console.log('🎁 Insertando recompensas...')
    await client.query(`
      INSERT INTO rewards (name, description, points_cost, category, stock, is_popular, image_url)
      VALUES 
        ('Cerveza Gratis', 'Una cerveza nacional de cortesía', 100, 'Bebidas', 50, true, '/images/reward-cerveza.jpg'),
        ('Cóctel Premium', 'Un cóctel de la casa gratis', 200, 'Bebidas', 30, true, '/images/reward-coctel.jpg'),
        ('Nachos con Todo', 'Porción de nachos completos', 150, 'Comida', 40, false, '/images/reward-nachos.jpg'),
        ('Alitas x6', '6 alitas en la salsa que prefieras', 180, 'Comida', 35, true, '/images/reward-alitas.jpg'),
        ('10% Descuento', '10% de descuento en tu cuenta', 250, 'Descuentos', 100, false, '/images/reward-10.jpg'),
        ('25% Descuento', '25% de descuento en tu cuenta', 500, 'Descuentos', 50, true, '/images/reward-25.jpg'),
        ('Mesa VIP 1 hora', 'Acceso a zona VIP por 1 hora', 800, 'Experiencias', 20, false, '/images/reward-vip.jpg'),
        ('Fiesta Cumpleaños', 'Decoración + postre + brindis', 1500, 'Experiencias', 10, true, '/images/reward-cumple.jpg'),
        ('Tabla de Cortesía', 'Tabla de picadas gratis', 400, 'Comida', 25, false, '/images/reward-tabla.jpg'),
        ('Botella de Vino', 'Botella de vino de la casa', 600, 'Bebidas', 20, false, '/images/reward-vino.jpg')
      ON CONFLICT DO NOTHING
    `)

    // ===================
    // SERVICIOS
    // ===================
    console.log('🛎️ Insertando servicios...')
    await client.query(`
      INSERT INTO services (name, description, points_required, points_earned, category, image_url)
      VALUES 
        ('Reserva de Mesa', 'Reserva tu mesa con anticipación', 0, 50, 'Reservas', '/images/serv-mesa.jpg'),
        ('Cumpleaños VIP', 'Paquete especial para cumpleaños', 500, 100, 'Eventos', '/images/serv-cumple.jpg'),
        ('Karaoke Privado', 'Sala privada de karaoke por 2 horas', 300, 75, 'Entretenimiento', '/images/serv-karaoke.jpg'),
        ('DJ Request', 'Pide tu canción favorita al DJ', 50, 10, 'Entretenimiento', '/images/serv-dj.jpg'),
        ('Área VIP', 'Acceso exclusivo a zona VIP', 1000, 200, 'VIP', '/images/serv-vip.jpg'),
        ('Delivery', 'Envío a domicilio de tu pedido', 0, 25, 'Delivery', '/images/serv-delivery.jpg'),
        ('Clase de Coctelería', 'Aprende a hacer cócteles', 200, 100, 'Eventos', '/images/serv-clase.jpg'),
        ('Estacionamiento VIP', 'Estacionamiento preferencial', 150, 30, 'VIP', '/images/serv-parking.jpg')
      ON CONFLICT DO NOTHING
    `)

    // ===================
    // TRANSACCIONES DE EJEMPLO
    // ===================
    console.log('📊 Insertando transacciones de ejemplo...')
    await client.query(`
      INSERT INTO transactions (user_id, type, points, description, reference_type)
      VALUES 
        (2, 'earned', 150, 'Compra en el bar', 'order'),
        (2, 'earned', 200, 'Compra en el bar', 'order'),
        (2, 'earned', 100, 'Bonus de bienvenida', 'promotion'),
        (2, 'redeemed', 100, 'Canje: Cerveza Gratis', 'redemption'),
        (2, 'earned', 50, 'Reserva de mesa', 'service'),
        (3, 'earned', 100, 'Compra en el bar', 'order'),
        (3, 'earned', 75, 'Compra en el bar', 'order')
      ON CONFLICT DO NOTHING
    `)

    await client.query('COMMIT')

    console.log('\n✅ Datos iniciales insertados exitosamente!')
    console.log('\n📝 Usuarios de prueba:')
    console.log('   • admin@bar.com / 123456 (Admin)')
    console.log('   • juan@email.com / 123456 (Usuario Oro)')
    console.log('   • maria@email.com / 123456 (Usuario Plata)')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error al insertar datos:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

module.exports = seedData
