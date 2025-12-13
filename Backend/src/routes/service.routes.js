/**
 * Service Routes
 * Rutas para servicios del bar
 */

const { Router } = require('express')
const { 
  getServices, 
  getServiceById, 
  bookService,
  getCategories,
  createService, 
  updateService 
} = require('../controllers/service.controller')
const { verifyToken, requireRole } = require('../middlewares')

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

module.exports = router
