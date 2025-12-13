/**
 * Product Routes
 * Rutas para el menú de productos
 */

const { Router } = require('express')
const { 
  getProducts, 
  getProductById, 
  searchProducts,
  getCategories,
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/product.controller')
const { verifyToken, requireRole } = require('../middlewares')

const router = Router()

// Rutas públicas
router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/search', searchProducts)
router.get('/:id', getProductById)

// Rutas protegidas (Admin)
router.post('/', verifyToken, requireRole('admin'), createProduct)
router.put('/:id', verifyToken, requireRole('admin'), updateProduct)
router.delete('/:id', verifyToken, requireRole('admin'), deleteProduct)

module.exports = router
