/**
 * Controllers Index
 * Exporta todos los controladores
 */

const authController = require('./auth.controller')
const productController = require('./product.controller')
const rewardController = require('./reward.controller')
const serviceController = require('./service.controller')
const profileController = require('./profile.controller')

module.exports = {
  authController,
  productController,
  rewardController,
  serviceController,
  profileController
}
