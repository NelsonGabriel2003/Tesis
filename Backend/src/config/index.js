/**
 * Config Index
 * Exporta todas las configuraciones
 */

const database = require('./database')
const jwt = require('./jwt')
const telegram = require('./telegram')
module.exports = {
  database,
  jwt,
  telegram
}
