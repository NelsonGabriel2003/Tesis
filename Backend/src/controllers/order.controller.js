/**
 * Order Controller
 * Maneja operaciones de pedidos
 */

import PedidoModel from '../models/pedido.model.js'
import ItemPedidoModel from '../models/itemPedido.model.js'
import ProductoModel from '../models/producto.model.js'
import UsuarioModel from '../models/usuario.model.js'
import MovimientoModel from '../models/movimiento.model.js'
import ConfigModel from '../models/configuracion.model.js'
import { codeGenerator, qrService, telegramService, pdfService } from '../services/index.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Crear pedido
 * POST /api/orders
 */
const create = asyncHandler(async (req, res) => {
  const usuarioId = req.user.id
  const { items, tableNumber, notes } = req.body

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'El pedido debe tener al menos un producto' })
  }

  const pedidosActivos = await PedidoModel.contarPorUsuarioYEstado(usuarioId, ['pendiente', 'aprobado', 'preparando'])
  if (pedidosActivos >= 3) {
    return res.status(400).json({ success: false, message: 'Tienes demasiados pedidos activos' })
  }

  let subtotal = 0
  let puntosTotales = 0
  const itemsPedido = []

  for (const item of items) {
    const producto = await ProductoModel.buscarPorId(item.productId)
    if (!producto || !producto.disponible) {
      return res.status(400).json({ success: false, message: `Producto no disponible: ${item.productId}` })
    }

    const cantidad = Math.min(Math.max(item.quantity, 1), 10)
    const totalItem = parseFloat(producto.precio) * cantidad
    const puntosItem = producto.puntos_otorgados * cantidad

    subtotal += totalItem
    puntosTotales += puntosItem

    itemsPedido.push({
      productoId: producto.id,
      nombreProducto: producto.nombre,
      precioProducto: parseFloat(producto.precio),
      puntosPorItem: producto.puntos_otorgados,
      cantidad,
      totalItem,
      puntosTotales: puntosItem
    })
  }

  const codigoPedido = codeGenerator.generateOrderCode()

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const pedido = await PedidoModel.crear({
    usuario_id: usuarioId,
    codigo_pedido: codigoPedido,
    subtotal,
    descuento: 0,
    total: subtotal,
    puntos_a_ganar: puntosTotales,
    numero_mesa: tableNumber,
    notas: notes,
    datos_qr: codeGenerator.generateQRData(codigoPedido, null)
  }, req.user?.id, infoSolicitud)

  const itemsCreados = []
  for (const item of itemsPedido) {
    const itemCreado = await ItemPedidoModel.crear({
      pedido_id: pedido.id,
      producto_id: item.productoId,
      nombre_producto: item.nombreProducto,
      precio_producto: item.precioProducto,
      puntos_por_item: item.puntosPorItem,
      cantidad: item.cantidad,
      total_item: item.totalItem,
      puntos_total: item.puntosTotales
    })
    itemsCreados.push(itemCreado)
  }

  const qrCode = await qrService.generateOrderQR(codigoPedido, pedido.id)

  const usuario = await UsuarioModel.buscarPorId(usuarioId)
  const pedidoConUsuario = { ...pedido, user_name: usuario.nombre, user_phone: usuario.telefono }

  const telegramMessageId = await telegramService.sendOrderAlert(pedidoConUsuario, itemsCreados)
  if (telegramMessageId) {
    await PedidoModel.establecerTelegramMensajeId(pedido.id, telegramMessageId.toString())
  }

  res.status(201).json({
    success: true,
    data: {
      order: { ...pedido, items: itemsCreados, qrCode },
      message: 'Pedido enviado. Esperando confirmación.'
    }
  })
})

/**
 * Obtener mis pedidos
 * GET /api/orders/my
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const usuarioId = req.user.id
  const { limit = 20, offset = 0 } = req.query
  const pedidos = await PedidoModel.obtenerPorUsuario(usuarioId, parseInt(limit), parseInt(offset))

  for (let pedido of pedidos) {
    pedido.items = await ItemPedidoModel.obtenerPorPedido(pedido.id)
  }

  res.json({ success: true, data: pedidos })
})

/**
 * Obtener pedidos activos
 * GET /api/orders/active
 */
const getActiveOrders = asyncHandler(async (req, res) => {
  const usuarioId = req.user.id
  const pedidos = await PedidoModel.obtenerActivosPorUsuario(usuarioId)

  for (let pedido of pedidos) {
    pedido.items = await ItemPedidoModel.obtenerPorPedido(pedido.id)
    pedido.qrCode = await qrService.generateOrderQR(pedido.codigo_pedido, pedido.id)
  }

  res.json({ success: true, data: pedidos })
})

/**
 * Obtener pedido por ID
 * GET /api/orders/:id
 */
const getById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const pedido = await PedidoModel.buscarPorId(id)

  if (!pedido) {
    return res.status(404).json({ success: false, message: 'Pedido no encontrado' })
  }

  pedido.items = await ItemPedidoModel.obtenerPorPedido(pedido.id)
  pedido.qrCode = await qrService.generateOrderQR(pedido.codigo_pedido, pedido.id)

  res.json({ success: true, data: pedido })
})

/**
 * Cancelar pedido
 * POST /api/orders/:id/cancel
 */
const cancel = asyncHandler(async (req, res) => {
  const { id } = req.params
  const usuarioId = req.user.id
  const pedido = await PedidoModel.buscarPorId(id)

  if (!pedido) {
    return res.status(404).json({ success: false, message: 'Pedido no encontrado' })
  }

  if (pedido.usuario_id !== usuarioId) {
    return res.status(403).json({ success: false, message: 'No autorizado' })
  }

  if (pedido.estado !== 'pendiente') {
    return res.status(400).json({ success: false, message: 'Solo se pueden cancelar pedidos pendientes' })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const pedidoActualizado = await PedidoModel.actualizarEstado(id, 'cancelado', req.user?.id, infoSolicitud)
  res.json({ success: true, data: pedidoActualizado, message: 'Pedido cancelado' })
})

/**
 * Obtener pedidos pendientes (Staff)
 * GET /api/orders/pending
 */
const getPending = asyncHandler(async (req, res) => {
  const pedidos = await PedidoModel.obtenerPendientes()
  for (let pedido of pedidos) {
    pedido.items = await ItemPedidoModel.obtenerPorPedido(pedido.id)
  }
  res.json({ success: true, data: pedidos })
})

/**
 * Aprobar pedido (Staff)
 * POST /api/orders/:id/approve
 */
const approve = asyncHandler(async (req, res) => {
  const { id } = req.params
  const pedido = await PedidoModel.buscarPorId(id)

  if (!pedido || pedido.estado !== 'pendiente') {
    return res.status(400).json({ success: false, message: 'El pedido no está pendiente' })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const pedidoActualizado = await PedidoModel.actualizarEstado(id, 'aprobado', req.user?.id, infoSolicitud)
  res.json({ success: true, data: pedidoActualizado, message: 'Pedido aprobado' })
})

/**
 * Rechazar pedido (Staff)
 * POST /api/orders/:id/reject
 */
const reject = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { reason } = req.body
  const pedido = await PedidoModel.buscarPorId(id)

  if (!pedido || pedido.estado !== 'pendiente') {
    return res.status(400).json({ success: false, message: 'El pedido no está pendiente' })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const pedidoActualizado = await PedidoModel.actualizarEstado(id, 'rechazado', req.user?.id, infoSolicitud, { motivo_rechazo: reason })
  res.json({ success: true, data: pedidoActualizado, message: 'Pedido rechazado' })
})

/**
 * Completar pedido (Staff)
 * POST /api/orders/:id/complete
 */
const complete = asyncHandler(async (req, res) => {
  const { id } = req.params
  const pedido = await PedidoModel.buscarPorId(id)

  if (!pedido || pedido.estado !== 'preparando') {
    return res.status(400).json({ success: false, message: 'El pedido no está en preparación' })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const pedidoActualizado = await PedidoModel.actualizarEstado(id, 'completado', req.user?.id, infoSolicitud, {
    puntos_ganados: pedido.puntos_a_ganar
  })

  if (pedido.usuario_id) {
    await UsuarioModel.agregarPuntos(pedido.usuario_id, pedido.puntos_a_ganar)
    await MovimientoModel.crear({
      usuario_id: pedido.usuario_id,
      tipo: 'ganado',
      puntos: pedido.puntos_a_ganar,
      descripcion: `Compra - Pedido #${pedido.codigo_pedido}`,
      tipo_referencia: 'pedido',
      referencia_id: pedido.id
    })
  }

  res.json({ success: true, data: pedidoActualizado, message: `+${pedido.puntos_a_ganar} puntos acreditados` })
})

/**
 * Descargar PDF del pedido
 * GET /api/orders/:id/pdf
 */
const downloadPDF = asyncHandler(async (req, res) => {
  const { id } = req.params
  const pedido = await PedidoModel.buscarPorId(id)

  if (!pedido) {
    return res.status(404).json({ success: false, message: 'Pedido no encontrado' })
  }

  // Solo permite PDF de pedidos completados o entregados
  if (!['completado', 'entregado'].includes(pedido.estado)) {
    return res.status(400).json({
      success: false,
      message: 'El comprobante solo está disponible para pedidos completados'
    })
  }

  // Obtener items del pedido
  const items = await ItemPedidoModel.obtenerPorPedido(pedido.id)

  // Obtener configuración del negocio
  let config = {}
  try {
    const configData = await ConfigModel.obtenerTodas()
    config = {
      nombre_negocio: configData.find(c => c.clave === 'nombre_negocio')?.valor || 'Establecimiento',
      direccion: configData.find(c => c.clave === 'direccion')?.valor || '',
      telefono: configData.find(c => c.clave === 'telefono')?.valor || ''
    }
  } catch (e) {
    console.error('Error obteniendo config:', e)
  }

  // Generar PDF
  const pdfBuffer = await pdfService.generarPDFPedido(pedido, items, config)

  // Enviar PDF
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=comprobante-${pedido.codigo_pedido}.pdf`)
  res.setHeader('Content-Length', pdfBuffer.length)
  res.send(pdfBuffer)
})

export const orderController = {
  create,
  getMyOrders,
  getActiveOrders,
  getById,
  cancel,
  getPending,
  approve,
  reject,
  complete,
  downloadPDF
}