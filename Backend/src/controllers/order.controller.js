const { OrderModel, OrderItemModel, ProductModel, UserModel, TransactionModel } = require('../models')
const { codeGenerator, qrService, telegramService } = require('../services')

const OrderController = {
  create: async (req, res) => {
    try {
      const userId = req.user.id
      const { items, tableNumber, notes } = req.body

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'El pedido debe tener al menos un producto' })
      }

      const activeOrders = await OrderModel.countByUserAndStatus(userId, ['pending', 'approved', 'preparing'])
      if (activeOrders >= 3) {
        return res.status(400).json({ success: false, message: 'Tienes demasiados pedidos activos' })
      }

      let subtotal = 0
      let totalPoints = 0
      const orderItems = []

      for (const item of items) {
        const product = await ProductModel.findById(item.productId)
        if (!product || !product.is_available) {
          return res.status(400).json({ success: false, message: `Producto no disponible: ${item.productId}` })
        }

        const quantity = Math.min(Math.max(item.quantity, 1), 10)
        const itemTotal = parseFloat(product.price) * quantity
        const itemPoints = product.points_earned * quantity

        subtotal += itemTotal
        totalPoints += itemPoints

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: parseFloat(product.price),
          pointsPerItem: product.points_earned,
          quantity,
          itemTotal,
          pointsTotal: itemPoints
        })
      }

      const orderCode = codeGenerator.generateOrderCode()

      const order = await OrderModel.create({
        userId,
        orderCode,
        subtotal,
        discount: 0,
        total: subtotal,
        pointsToEarn: totalPoints,
        tableNumber,
        notes,
        qrCodeData: codeGenerator.generateQRData(orderCode, null)
      })

      const createdItems = []
      for (const item of orderItems) {
        const createdItem = await OrderItemModel.create({ orderId: order.id, ...item })
        createdItems.push(createdItem)
      }

      const qrCode = await qrService.generateOrderQR(orderCode, order.id)

      const user = await UserModel.findById(userId)
      const orderWithUser = { ...order, user_name: user.name, user_phone: user.phone }

      const telegramMessageId = await telegramService.sendOrderAlert(orderWithUser, createdItems)
      if (telegramMessageId) {
        await OrderModel.setTelegramMessageId(order.id, telegramMessageId.toString())
      }

      res.status(201).json({
        success: true,
        data: {
          order: { ...order, items: createdItems, qrCode },
          message: 'Pedido enviado. Esperando confirmación.'
        }
      })

    } catch (error) {
      console.error('Error creando pedido:', error)
      res.status(500).json({ success: false, message: 'Error al crear el pedido' })
    }
  },

  getMyOrders: async (req, res) => {
    try {
      const userId = req.user.id
      const { limit = 20, offset = 0 } = req.query
      const orders = await OrderModel.findByUserId(userId, parseInt(limit), parseInt(offset))

      for (let order of orders) {
        order.items = await OrderItemModel.findByOrderId(order.id)
      }

      res.json({ success: true, data: orders })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al obtener pedidos' })
    }
  },

  getActiveOrders: async (req, res) => {
    try {
      const userId = req.user.id
      const orders = await OrderModel.findActiveByUserId(userId)

      for (let order of orders) {
        order.items = await OrderItemModel.findByOrderId(order.id)
        order.qrCode = await qrService.generateOrderQR(order.order_code, order.id)
      }

      res.json({ success: true, data: orders })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al obtener pedidos activos' })
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params
      const order = await OrderModel.findById(id)

      if (!order) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado' })
      }

      order.items = await OrderItemModel.findByOrderId(order.id)
      order.qrCode = await qrService.generateOrderQR(order.order_code, order.id)

      res.json({ success: true, data: order })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al obtener el pedido' })
    }
  },

  cancel: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id
      const order = await OrderModel.findById(id)

      if (!order) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado' })
      }

      if (order.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'No autorizado' })
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Solo se pueden cancelar pedidos pendientes' })
      }

      const updatedOrder = await OrderModel.updateStatus(id, 'cancelled')
      res.json({ success: true, data: updatedOrder, message: 'Pedido cancelado' })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al cancelar el pedido' })
    }
  },

  getPending: async (req, res) => {
    try {
      const orders = await OrderModel.findPending()
      for (let order of orders) {
        order.items = await OrderItemModel.findByOrderId(order.id)
      }
      res.json({ success: true, data: orders })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al obtener pedidos' })
    }
  },

  approve: async (req, res) => {
    try {
      const { id } = req.params
      const order = await OrderModel.findById(id)

      if (!order || order.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'El pedido no está pendiente' })
      }

      const updatedOrder = await OrderModel.updateStatus(id, 'approved')
      res.json({ success: true, data: updatedOrder, message: 'Pedido aprobado' })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al aprobar' })
    }
  },

  reject: async (req, res) => {
    try {
      const { id } = req.params
      const { reason } = req.body
      const order = await OrderModel.findById(id)

      if (!order || order.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'El pedido no está pendiente' })
      }

      const updatedOrder = await OrderModel.updateStatus(id, 'rejected', null, { rejectionReason: reason })
      res.json({ success: true, data: updatedOrder, message: 'Pedido rechazado' })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al rechazar' })
    }
  },

  complete: async (req, res) => {
    try {
      const { id } = req.params
      const order = await OrderModel.findById(id)

      if (!order || order.status !== 'preparing') {
        return res.status(400).json({ success: false, message: 'El pedido no está en preparación' })
      }

      const updatedOrder = await OrderModel.updateStatus(id, 'completed', null, {
        pointsEarned: order.points_to_earn
      })

      if (order.user_id) {
        await UserModel.addPoints(order.user_id, order.points_to_earn)
        await TransactionModel.create({
          userId: order.user_id,
          type: 'earned',
          points: order.points_to_earn,
          description: `Compra - Pedido #${order.order_code}`,
          referenceType: 'order',
          referenceId: order.id
        })
      }

      res.json({ success: true, data: updatedOrder, message: `+${order.points_to_earn} puntos acreditados` })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'Error al completar' })
    }
  }
}

module.exports = OrderController