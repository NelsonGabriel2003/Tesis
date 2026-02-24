/**
 * Search Controller
 * Búsqueda global en productos, servicios y recompensas
 */

import ProductoModel from '../models/producto.model.js'
import RecompensaModel from '../models/recompensa.model.js'
import ServicioModel from '../models/servicio.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Búsqueda global
 * GET /api/search?q=cerveza
 */
const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query

  if (!q || !q.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Ingresa un término de búsqueda'
    })
  }

  // Buscar en paralelo
  const [productos, recompensas, servicios] = await Promise.all([
    ProductoModel.buscar(q).catch(() => []),
    RecompensaModel.buscar(q).catch(() => []),
    ServicioModel.buscar(q).catch(() => [])
  ])

  // Formatear resultados
  const results = [
    ...productos.slice(0, 5).map(p => ({
      id: `product-${p.id}`,
      name: p.nombre,
      description: p.descripcion,
      type: 'producto',
      route: '/menu',
      icon: '🍽️',
      imageUrl: p.imagen_url
    })),
    ...recompensas.slice(0, 3).map(r => ({
      id: `reward-${r.id}`,
      name: r.nombre,
      description: r.descripcion,
      type: 'recompensa',
      route: '/canje',
      icon: '🎁',
      imageUrl: r.imagen_url
    })),
    ...servicios.slice(0, 3).map(s => ({
      id: `service-${s.id}`,
      name: s.nombre,
      description: s.descripcion,
      type: 'servicio',
      route: '/servicios',
      icon: '🔧',
      imageUrl: s.imagen_url
    }))
  ]

  res.json({
    success: true,
    query: q,
    count: results.length,
    data: results
  })
})

export { globalSearch }
