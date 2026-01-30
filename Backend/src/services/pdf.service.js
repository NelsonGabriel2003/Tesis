/**
 * PDF Service
 * Genera comprobantes PDF de pedidos
 */

import PDFDocument from 'pdfkit'

/**
 * Genera un comprobante PDF formal del pedido
 * @param {Object} pedido - Datos del pedido
 * @param {Array} items - Items del pedido
 * @param {Object} config - Configuración del negocio
 * @returns {Promise<Buffer>} - Buffer del PDF
 */
export const generarPDFPedido = async (pedido, items = [], config = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Comprobante - ${pedido.codigo_pedido}`,
          Author: config.nombre_negocio || 'Sistema de Fidelización',
          Subject: 'Comprobante de Pedido'
        }
      })

      const chunks = []
      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const primaryColor = '#7C3AED'
      const textDark = '#1F2937'
      const textMuted = '#6B7280'
      const lineColor = '#E5E7EB'

      // === ENCABEZADO DEL NEGOCIO ===
      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .text(config.nombre_negocio || 'ESTABLECIMIENTO', { align: 'center' })

      if (config.direccion) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor(textMuted)
          .text(config.direccion, { align: 'center' })
      }

      if (config.telefono) {
        doc.text(`Tel: ${config.telefono}`, { align: 'center' })
      }

      doc.moveDown(1.5)

      // === TÍTULO DEL DOCUMENTO ===
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor(textDark)
        .text('COMPROBANTE DE PEDIDO', { align: 'center' })

      doc.moveDown(0.3)

      doc
        .fontSize(20)
        .fillColor(primaryColor)
        .text(`N° ${pedido.codigo_pedido}`, { align: 'center' })

      doc.moveDown(1)

      // === LÍNEA DECORATIVA ===
      dibujarLinea(doc, lineColor)
      doc.moveDown(1)

      // === CÓDIGO QR ===
      if (pedido.datos_qr) {
        try {
          const qrBase64 = pedido.datos_qr.replace(/^data:image\/\w+;base64,/, '')
          const qrBuffer = Buffer.from(qrBase64, 'base64')

          const qrX = (doc.page.width - 120) / 2
          doc.image(qrBuffer, qrX, doc.y, { width: 120, height: 120 })
          doc.y += 130
        } catch (qrError) {
          console.error('Error al insertar QR:', qrError)
        }
      }

      doc.moveDown(0.5)

      // === INFORMACIÓN GENERAL ===
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(textDark)
        .text('DATOS DEL PEDIDO', 50)

      doc.moveDown(0.5)

      const infoStartY = doc.y

      // Columna izquierda
      doc.fontSize(10).font('Helvetica').fillColor(textMuted)
      doc.text('Fecha:', 50, infoStartY)
      doc.text('Mesa:', 50, infoStartY + 18)
      doc.text('Cliente:', 50, infoStartY + 36)

      doc.font('Helvetica-Bold').fillColor(textDark)
      doc.text(formatearFecha(pedido.fecha_pedido), 120, infoStartY)
      doc.text(pedido.numero_mesa || 'N/A', 120, infoStartY + 18)
      doc.text(pedido.nombre_usuario || 'N/A', 120, infoStartY + 36)

      // Columna derecha
      doc.font('Helvetica').fillColor(textMuted)
      doc.text('Atendido por:', 320, infoStartY)

      doc.font('Helvetica-Bold').fillColor(textDark)
      doc.text(pedido.nombre_personal || 'N/A', 410, infoStartY)

      doc.y = infoStartY + 60
      doc.moveDown(1)

      // === LÍNEA SEPARADORA ===
      dibujarLinea(doc, lineColor)
      doc.moveDown(1)

      // === DETALLE DE PRODUCTOS ===
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(textDark)
        .text('DETALLE DE PRODUCTOS', 50)

      doc.moveDown(0.5)

      // Encabezados de tabla
      const tableTop = doc.y
      doc.fontSize(9).font('Helvetica-Bold').fillColor(textMuted)
      doc.text('DESCRIPCIÓN', 50, tableTop)
      doc.text('CANT.', 340, tableTop, { width: 50, align: 'center' })
      doc.text('P. UNIT.', 400, tableTop, { width: 60, align: 'right' })
      doc.text('SUBTOTAL', 470, tableTop, { width: 75, align: 'right' })

      doc.y = tableTop + 15
      dibujarLinea(doc, lineColor, 0.5)
      doc.moveDown(0.5)

      // Items
      doc.font('Helvetica').fillColor(textDark).fontSize(10)

      if (items && items.length > 0) {
        items.forEach(item => {
          const itemY = doc.y
          const precioUnit = parseFloat(item.precio_producto || item.precio_unitario || 0)
          const subtotalItem = parseFloat(item.total_item || precioUnit * item.cantidad).toFixed(2)

          doc.text(item.nombre_producto || item.nombre || 'Producto', 50, itemY, { width: 280 })
          doc.text(item.cantidad.toString(), 340, itemY, { width: 50, align: 'center' })
          doc.text(`$${precioUnit.toFixed(2)}`, 400, itemY, { width: 60, align: 'right' })
          doc.text(`$${subtotalItem}`, 470, itemY, { width: 75, align: 'right' })

          doc.moveDown(0.7)
        })
      } else {
        doc.fillColor(textMuted).text('Sin items registrados', 50)
        doc.moveDown(0.7)
      }

      doc.moveDown(0.5)
      dibujarLinea(doc, lineColor)
      doc.moveDown(1)

      // === TOTALES ===
      const totalesX = 380

      doc.fontSize(10).font('Helvetica').fillColor(textMuted)
      doc.text('Subtotal:', totalesX, doc.y)
      doc.fillColor(textDark).text(`$${parseFloat(pedido.subtotal || 0).toFixed(2)}`, 470, doc.y - 12, { width: 75, align: 'right' })

      if (parseFloat(pedido.descuento) > 0) {
        doc.fillColor(textMuted).text('Descuento:', totalesX, doc.y)
        doc.fillColor('#059669').text(`-$${parseFloat(pedido.descuento).toFixed(2)}`, 470, doc.y - 12, { width: 75, align: 'right' })
      }

      doc.moveDown(0.8)

      // Total destacado
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor(textDark)
        .text('TOTAL:', totalesX, doc.y)

      doc
        .fillColor(primaryColor)
        .text(`$${parseFloat(pedido.total || 0).toFixed(2)}`, 470, doc.y - 14, { width: 75, align: 'right' })

      doc.moveDown(1)

      // Puntos ganados
      if (pedido.puntos_ganados > 0 || pedido.puntos_a_ganar > 0) {
        const puntos = pedido.puntos_ganados || pedido.puntos_a_ganar
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor(primaryColor)
          .text(`Puntos obtenidos: +${puntos} pts`, { align: 'center' })

        doc.moveDown(1)
      }

      // === NOTAS ===
      if (pedido.notas) {
        dibujarLinea(doc, lineColor)
        doc.moveDown(0.5)

        doc.fontSize(10).font('Helvetica-Bold').fillColor(textMuted).text('Observaciones:', 50)
        doc.font('Helvetica').fillColor(textDark).text(pedido.notas, 50, doc.y + 3, { width: 495 })

        doc.moveDown(1)
      }

      // === PIE DE PÁGINA ===
      const footerY = doc.page.height - 80

      dibujarLinea(doc, lineColor, 1, footerY - 10)

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(textDark)
        .text('¡Gracias por su preferencia!', 50, footerY, { align: 'center', width: 495 })

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(textMuted)
        .text(
          `Documento generado el ${new Date().toLocaleString('es-EC')}`,
          50,
          footerY + 20,
          { align: 'center', width: 495 }
        )

      doc.end()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Dibuja una línea horizontal
 */
function dibujarLinea(doc, color, width = 1, y = null) {
  const posY = y || doc.y
  doc
    .strokeColor(color)
    .lineWidth(width)
    .moveTo(50, posY)
    .lineTo(545, posY)
    .stroke()
}

/**
 * Formatea la fecha
 */
function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default { generarPDFPedido }
