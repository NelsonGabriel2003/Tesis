/**
 * Config Index
 * Exporta todas las configuraciones
 */

const database = require('./database')
const jwt = require('./jwt')

module.exports = {
  database,
  jwt,
}
