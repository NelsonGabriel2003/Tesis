/**
 * Controllers Index
 * Exporta todos los controladores
 */

// Controllers que exportan objeto con nombre
import { orderController } from './order.controller.js'
import { staffController } from './staff.controller.js'

// Controllers que exportan funciones individuales
import * as authController from './auth.controller.js'
import * as productController from './product.controller.js'
import * as rewardController from './reward.controller.js'
import * as serviceController from './service.controller.js'
import * as profileController from './profile.controller.js'
import * as statsController from './stats.controller.js'

export {
  authController,
  productController,
  rewardController,
  serviceController,
  profileController,
  orderController,
  staffController,
  statsController
}
