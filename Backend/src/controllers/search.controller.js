/**
 * Search Controller
 * Búsqueda global en productos, servicios y recompensas
 */

import ProductModel from '../models/product.model.js'
import RewardModel from '../models/reward.model.js'
import ServiceModel from '../models/service.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Búsqueda global
 * GET /api/search?q=cerveza
 */
const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query

  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'El término de búsqueda debe tener al menos 2 caracteres'
    })
  }

  // Buscar en paralelo
  const [products, rewards, services] = await Promise.all([
    ProductModel.search(q).catch(() => []),
    RewardModel.search(q).catch(() => []),
    ServiceModel.search(q).catch(() => [])
  ])

  // Formatear resultados
  const results = [
    ...products.slice(0, 5).map(p => ({
      id: `product-${p.id}`,
      name: p.name,
      description: p.description,
      type: 'producto',
      route: '/menu',
      icon: '🍽️',
      imageUrl: p.image_url
    })),
    ...rewards.slice(0, 3).map(r => ({
      id: `reward-${r.id}`,
      name: r.name,
      description: r.description,
      type: 'recompensa',
      route: '/canje',
      icon: '🎁',
      imageUrl: r.image_url
    })),
    ...services.slice(0, 3).map(s => ({
      id: `service-${s.id}`,
      name: s.name,
      description: s.description,
      type: 'servicio',
      route: '/servicios',
      icon: '🔧',
      imageUrl: s.image_url
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
