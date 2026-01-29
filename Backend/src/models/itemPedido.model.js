/**
 * Item Pedido Model
 * Consultas a la base de datos para items de pedidos
 */

import { query } from '../config/database.js'

const ItemPedidoModel = {
  /**
   * Crear un item de pedido
   */
  crear: async (datosItem) => {
    const {
      pedido_id, producto_id, nombre_producto, precio_producto,
      puntos_por_item, cantidad, total_item, puntos_total, instrucciones_especiales
    } = datosItem

    const result = await query(
      `INSERT INTO items_pedido
        (pedido_id, producto_id, nombre_producto, precio_producto, puntos_por_item,
         cantidad, total_item, puntos_total, instrucciones_especiales)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [pedido_id, producto_id, nombre_producto, precio_producto, puntos_por_item,
       cantidad, total_item, puntos_total, instrucciones_especiales]
    )
    return result.rows[0]
  },

  /**
   * Obtener items de un pedido
   */
  obtenerPorPedido: async (pedidoId) => {
    const result = await query(
      `SELECT * FROM items_pedido WHERE pedido_id = $1 ORDER BY id`,
      [pedidoId]
    )
    return result.rows
  }
}

export default ItemPedidoModel
