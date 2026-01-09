/**
 * Service Routes
 * Rutas para servicios del bar
 */

import { Router } from 'express'
import {
  getServices,
  getServiceById,
  bookService,
  getCategories,
  createService,
  updateService
} from '../controllers/service.controller.js'
import { verifyToken, requireRole } from '../middlewares/index.js'

const router = Router()

// Rutas públicas
router.get('/', getServices)
router.get('/categories', getCategories)
router.get('/:id', getServiceById)

// Rutas protegidas (Usuario autenticado)
router.post('/:id/book', verifyToken, bookService)

// Rutas protegidas (Admin)
router.post('/', verifyToken, requireRole('admin'), createService)
router.put('/:id', verifyToken, requireRole('admin'), updateService)

export default router
