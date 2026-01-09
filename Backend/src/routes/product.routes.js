/**
 * Product Routes
 * Rutas para el menú de productos
 */

import { Router } from 'express'
import {
  getProducts,
  getProductById,
  searchProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js'
import { verifyToken, requireRole } from '../middlewares/index.js'

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

export default router
