/**
 * Estadisticas Model
 * Consultas a la base de datos para estadisticas del dashboard
 */

import { query } from '../config/database.js'

const EstadisticasModel = {
  /**
   * Obtener total de usuarios (solo rol 'usuario')
   */
  obtenerTotalUsuarios: async () => {
    const result = await query(
      `SELECT COUNT(*) as total FROM usuarios WHERE rol = 'usuario'`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener usuarios por nivel
   */
  obtenerUsuariosPorNivel: async () => {
    const result = await query(
      `SELECT nivel_membresia, COUNT(*) as total
       FROM usuarios
       WHERE rol = 'usuario'
       GROUP BY nivel_membresia`
    )
    return result.rows
  },

  /**
   * Obtener total de productos activos
   */
  obtenerTotalProductos: async () => {
    const result = await query(
      `SELECT COUNT(*) as total FROM productos WHERE disponible = true`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener total de recompensas activas
   */
  obtenerTotalRecompensas: async () => {
    const result = await query(
      `SELECT COUNT(*) as total FROM recompensas WHERE disponible = true`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener total de servicios activos
   */
  obtenerTotalServicios: async () => {
    const result = await query(
      `SELECT COUNT(*) as total FROM servicios WHERE disponible = true`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener total de canjes realizados
   */
  obtenerTotalCanjes: async () => {
    const result = await query(
      `SELECT COUNT(*) as total FROM canjes`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener canjes por estado
   */
  obtenerCanjesPorEstado: async () => {
    const result = await query(
      `SELECT estado, COUNT(*) as total
       FROM canjes
       GROUP BY estado`
    )
    return result.rows
  },

  /**
   * Obtener total de puntos emitidos
   */
  obtenerTotalPuntosEmitidos: async () => {
    const result = await query(
      `SELECT COALESCE(SUM(puntos), 0) as total
       FROM movimientos_puntos
       WHERE tipo = 'ganado'`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener total de puntos canjeados
   */
  obtenerTotalPuntosCanjeados: async () => {
    const result = await query(
      `SELECT COALESCE(SUM(puntos), 0) as total
       FROM movimientos_puntos
       WHERE tipo = 'canjeado'`
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Obtener movimientos recientes
   */
  obtenerMovimientosRecientes: async (limite = 10) => {
    const result = await query(
      `SELECT m.*, u.nombre as nombre_usuario, u.correo as correo_usuario
       FROM movimientos_puntos m
       JOIN usuarios u ON m.usuario_id = u.id
       ORDER BY m.fecha_movimiento DESC
       LIMIT $1`,
      [limite]
    )
    return result.rows
  },

  /**
   * Obtener usuarios recientes
   */
  obtenerUsuariosRecientes: async (limite = 5) => {
    const result = await query(
      `SELECT id, nombre, correo, nivel_membresia, puntos_actuales
       FROM usuarios
       WHERE rol = 'usuario'
       ORDER BY id DESC
       LIMIT $1`,
      [limite]
    )
    return result.rows
  },

  /**
   * Obtener todos los usuarios (para panel admin)
   */
  obtenerTodosUsuarios: async () => {
    const result = await query(
      `SELECT id, nombre, correo, nivel_membresia, puntos_actuales, puntos_totales
       FROM usuarios
       WHERE rol = 'usuario'
       ORDER BY id DESC`
    )
    return result.rows
  },

  /**
   * Obtener canjes recientes
   */
  obtenerCanjesRecientes: async (limite = 5) => {
    const result = await query(
      `SELECT c.*, u.nombre as nombre_usuario, r.nombre as nombre_recompensa
       FROM canjes c
       JOIN usuarios u ON c.usuario_id = u.id
       JOIN recompensas r ON c.recompensa_id = r.id
       ORDER BY c.fecha_canje DESC
       LIMIT $1`,
      [limite]
    )
    return result.rows
  },

  /**
   * Obtener top productos mas vendidos
   */
  obtenerTopProductos: async (limite = 10) => {
    const result = await query(
      `SELECT ip.nombre_producto, SUM(ip.cantidad) as total_vendido,
              SUM(ip.total_item) as ingresos
       FROM items_pedido ip
       JOIN pedidos p ON ip.pedido_id = p.id
       WHERE p.estado IN ('completado', 'entregado')
       GROUP BY ip.nombre_producto
       ORDER BY total_vendido DESC
       LIMIT $1`,
      [limite]
    )
    return result.rows
  },

  /**
   * Obtener ventas por categoria
   */
  obtenerVentasPorCategoria: async () => {
    const result = await query(
      `SELECT pr.categoria, SUM(ip.cantidad) as total_vendido,
              SUM(ip.total_item) as ingresos
       FROM items_pedido ip
       JOIN pedidos p ON ip.pedido_id = p.id
       JOIN productos pr ON ip.producto_id = pr.id
       WHERE p.estado IN ('completado', 'entregado')
       GROUP BY pr.categoria
       ORDER BY ingresos DESC`
    )
    return result.rows
  },

  /**
   * Obtener ingresos por periodo
   */
  obtenerIngresosPorPeriodo: async (dias = 30) => {
    const result = await query(
      `SELECT DATE(p.fecha_pedido) as fecha,
              COUNT(DISTINCT p.id) as total_pedidos,
              SUM(p.total) as ingresos
       FROM pedidos p
       WHERE p.estado IN ('completado', 'entregado')
         AND p.fecha_pedido >= CURRENT_DATE - INTERVAL '1 day' * $1
       GROUP BY DATE(p.fecha_pedido)
       ORDER BY fecha ASC`,
      [dias]
    )
    return result.rows
  },

  /**
   * Obtener resumen completo del dashboard
   */
  obtenerResumenDashboard: async () => {
    const [
      totalUsuarios,
      usuariosPorNivel,
      totalProductos,
      totalRecompensas,
      totalServicios,
      totalCanjes,
      canjesPorEstado,
      puntosEmitidos,
      puntosCanjeados,
      usuariosRecientes,
      canjesRecientes
    ] = await Promise.all([
      EstadisticasModel.obtenerTotalUsuarios(),
      EstadisticasModel.obtenerUsuariosPorNivel(),
      EstadisticasModel.obtenerTotalProductos(),
      EstadisticasModel.obtenerTotalRecompensas(),
      EstadisticasModel.obtenerTotalServicios(),
      EstadisticasModel.obtenerTotalCanjes(),
      EstadisticasModel.obtenerCanjesPorEstado(),
      EstadisticasModel.obtenerTotalPuntosEmitidos(),
      EstadisticasModel.obtenerTotalPuntosCanjeados(),
      EstadisticasModel.obtenerUsuariosRecientes(),
      EstadisticasModel.obtenerCanjesRecientes()
    ])

    return {
      totalUsuarios,
      usuariosPorNivel,
      totalProductos,
      totalRecompensas,
      totalServicios,
      totalCanjes,
      canjesPorEstado,
      puntosEmitidos,
      puntosCanjeados,
      usuariosRecientes,
      canjesRecientes
    }
  }
}

export default EstadisticasModel