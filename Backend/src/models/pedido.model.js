/**
 * Pedido Model
 * Consultas a la base de datos para pedidos
 */

import { query } from '../config/database.js'

const PedidoModel = {
  /**
   * Crear un nuevo pedido
   */
  crear: async (datosPedido) => {
    const {
      usuario_id, codigo_pedido, subtotal, descuento, total,
      puntos_a_ganar, numero_mesa, notas, datos_qr
    } = datosPedido

    const result = await query(
      `INSERT INTO pedidos
        (usuario_id, codigo_pedido, subtotal, descuento, total, puntos_a_ganar, numero_mesa, notas, datos_qr)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [usuario_id, codigo_pedido, subtotal, descuento || 0, total, puntos_a_ganar, numero_mesa, notas, datos_qr]
    )
    return result.rows[0]
  },

  /**
   * Buscar pedido por ID
   */
  buscarPorId: async (id) => {
    const result = await query(
      `SELECT p.*,
              u.nombre as nombre_usuario, u.correo as correo_usuario, u.telefono as telefono_usuario,
              pe.nombre as nombre_personal
       FROM pedidos p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       LEFT JOIN personal pe ON p.personal_id = pe.id
       WHERE p.id = $1`,
      [id]
    )
    return result.rows[0]
  },

  /**
   * Buscar pedido por codigo
   */
  buscarPorCodigo: async (codigoPedido) => {
    const result = await query(
      `SELECT p.*, u.nombre as nombre_usuario, pe.nombre as nombre_personal
       FROM pedidos p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       LEFT JOIN personal pe ON p.personal_id = pe.id
       WHERE p.codigo_pedido = $1`,
      [codigoPedido]
    )
    return result.rows[0]
  },

  /**
   * Obtener pedidos de un usuario
   */
  obtenerPorUsuario: async (usuarioId, limite = 20, offset = 0) => {
    const result = await query(
      `SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY fecha_pedido DESC LIMIT $2 OFFSET $3`,
      [usuarioId, limite, offset]
    )
    return result.rows
  },

  /**
   * Obtener pedidos activos de un usuario
   */
  obtenerActivosPorUsuario: async (usuarioId) => {
    const result = await query(
      `SELECT * FROM pedidos
       WHERE usuario_id = $1 AND estado NOT IN ('entregado', 'rechazado', 'cancelado')
       ORDER BY fecha_pedido DESC`,
      [usuarioId]
    )
    return result.rows
  },

  /**
   * Obtener pedidos pendientes
   */
  obtenerPendientes: async () => {
    const result = await query(
      `SELECT p.*, u.nombre as nombre_usuario, u.telefono as telefono_usuario
       FROM pedidos p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.estado = 'pendiente'
       ORDER BY p.fecha_pedido ASC`
    )
    return result.rows
  },

  /**
   * Actualizar estado del pedido
   */
  actualizarEstado: async (id, estado, personalId = null, datosAdicionales = {}) => {
    const campoTimestamp = {
      aprobado: 'fecha_aprobacion',
      preparando: 'fecha_preparacion',
      completado: 'fecha_completado',
      entregado: 'fecha_entrega'
    }[estado]

    let setClause = `estado = $2`
    let params = [id, estado]
    let paramIndex = 3

    if (personalId) {
      setClause += `, personal_id = $${paramIndex++}`
      params.push(personalId)
    }

    if (campoTimestamp) {
      setClause += `, ${campoTimestamp} = CURRENT_TIMESTAMP`
    }

    if (datosAdicionales.motivo_rechazo) {
      setClause += `, motivo_rechazo = $${paramIndex++}`
      params.push(datosAdicionales.motivo_rechazo)
    }

    if (datosAdicionales.puntos_ganados !== undefined) {
      setClause += `, puntos_ganados = $${paramIndex++}`
      params.push(datosAdicionales.puntos_ganados)
    }

    const result = await query(
      `UPDATE pedidos SET ${setClause} WHERE id = $1 RETURNING *`,
      params
    )
    return result.rows[0]
  },

  /**
   * Establecer ID de mensaje de Telegram
   */
  establecerTelegramMensajeId: async (id, mensajeId) => {
    await query(
      `UPDATE pedidos SET telegram_mensaje_id = $2 WHERE id = $1`,
      [id, mensajeId]
    )
  },

  /**
   * Contar pedidos por usuario y estado
   */
  contarPorUsuarioYEstado: async (usuarioId, estados) => {
    const result = await query(
      `SELECT COUNT(*) as total FROM pedidos WHERE usuario_id = $1 AND estado = ANY($2)`,
      [usuarioId, estados]
    )
    return parseInt(result.rows[0].total)
  },

  /**
   * Cancelar pedidos pendientes que exceden el tiempo límite
   * @param {number} minutosLimite - Minutos después de los cuales se cancela
   * @returns {Array} - Pedidos cancelados
   */
  cancelarPendientesExpirados: async (minutosLimite = 6) => {
    const result = await query(
      `UPDATE pedidos
       SET estado = 'cancelado',
           motivo_rechazo = 'Tiempo de espera excedido - Sin respuesta del staff'
       WHERE estado = 'pendiente'
         AND fecha_pedido < NOW() - INTERVAL '${minutosLimite} minutes'
       RETURNING *`
    )
    return result.rows
  }
}

export default PedidoModel
