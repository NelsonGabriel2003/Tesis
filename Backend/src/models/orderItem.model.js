import { query } from '../config/database.js'

const OrderItemModel = {
  create: async (itemData) => {
    const { 
      orderId, productId, productName, productPrice, 
      pointsPerItem, quantity, itemTotal, pointsTotal 
    } = itemData

    const result = await query(
      `INSERT INTO order_items 
        (order_id, product_id, product_name, product_price, points_per_item, quantity, item_total, points_total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [orderId, productId, productName, productPrice, pointsPerItem, quantity, itemTotal, pointsTotal]
    )
    return result.rows[0]
  },

  findByOrderId: async (orderId) => {
    const result = await query(
      `SELECT oi.*, p.image_url as product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [orderId]
    )
    return result.rows
  }
}

export default OrderItemModel