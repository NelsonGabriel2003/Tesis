require('dotenv').config()
const { Pool } = require('pg')

console.log('🔍 Probando conexión...')
console.log('Host:', process.env.DB_HOST)
console.log('Port:', process.env.DB_PORT)
console.log('Database:', process.env.DB_NAME)
console.log('User:', process.env.DB_USER)
console.log('Password:', process.env.DB_PASSWORD ? '****' : 'VACÍO!')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ Conexión exitosa!')
    console.log('Hora del servidor:', res.rows[0].now)
    pool.end()
  })
  .catch(err => {
    console.log('❌ Error de conexión:', err.message)
    pool.end()
  })