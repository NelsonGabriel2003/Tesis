/**
 * Rutas públicas para comprobantes de pedidos
 * No requieren autenticación - accesibles via QR
 */

import { Router } from 'express'
import PedidoModel from '../models/pedido.model.js'
import ItemPedidoModel from '../models/itemPedido.model.js'
import ConfigModel from '../models/configuracion.model.js'
import { pdfService } from '../services/index.js'

const router = Router()

/**
 * Obtener comprobante PDF de un pedido
 * GET /api/comprobante/:codigo
 * PÚBLICO - No requiere autenticación
 */
router.get('/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params

    // Buscar pedido por código
    const pedido = await PedidoModel.buscarPorCodigo(codigo)

    if (!pedido) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Pedido no encontrado</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            h1 { color: #e53e3e; margin-bottom: 0.5rem; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>❌ Pedido no encontrado</h1>
            <p>El código <strong>${codigo}</strong> no existe o ha sido eliminado.</p>
          </div>
        </body>
        </html>
      `)
    }

    // Verificar que el pedido esté completado o entregado
    if (!['completado', 'entregado'].includes(pedido.estado)) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Comprobante no disponible</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            h1 { color: #d69e2e; margin-bottom: 0.5rem; }
            p { color: #666; }
            .status { background: #fef3c7; color: #92400e; padding: 0.5rem 1rem; border-radius: 0.5rem; display: inline-block; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⏳ Comprobante no disponible</h1>
            <p>El comprobante solo está disponible para pedidos completados.</p>
            <div class="status">Estado actual: ${pedido.estado}</div>
          </div>
        </body>
        </html>
      `)
    }

    // Obtener items del pedido
    const items = await ItemPedidoModel.obtenerPorPedido(pedido.id)

    // Obtener configuración del negocio
    let config = {}
    try {
      const configData = await ConfigModel.obtenerTodas()
      config = {
        nombre_negocio: configData.find(c => c.clave === 'nombre_negocio')?.valor || 'FOODIX',
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
    res.setHeader('Content-Disposition', `inline; filename=comprobante-${pedido.codigo_pedido}.pdf`)
    res.setHeader('Content-Length', pdfBuffer.length)
    res.send(pdfBuffer)

  } catch (error) {
    console.error('Error generando comprobante:', error)
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
          .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
          h1 { color: #e53e3e; margin-bottom: 0.5rem; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>❌ Error</h1>
          <p>No se pudo generar el comprobante. Intenta nuevamente.</p>
        </div>
      </body>
      </html>
    `)
  }
})

export default router