/**
 * Models Index
 * Exporta todos los modelos
 */

const UserModel = require('./user.model')
const ProductModel = require('./product.model')
const RewardModel = require('./reward.model')
const ServiceModel = require('./service.model')
const TransactionModel = require('./transaction.model')
const RedemptionModel = require('./redemption.model')

module.exports = {
  UserModel,
  ProductModel,
  RewardModel,
  ServiceModel,
  TransactionModel,
  RedemptionModel
}
