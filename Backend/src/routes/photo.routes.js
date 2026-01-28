/**
 * Photo Routes
 * Rutas para fotos/eventos
 */

import { Router } from 'express'
import {
  getPhotos,
  getPhotosAdmin,
  getPhotoById,
  createPhoto,
  updatePhoto,
  deletePhoto
} from '../controllers/photo.controller.js'
import { verifyToken, requireRole } from '../middlewares/index.js'

const router = Router()

// Rutas protegidas (Admin) - IMPORTANTE: antes de /:id
router.get('/admin/all', verifyToken, requireRole('admin'), getPhotosAdmin)

// Rutas publicas
router.get('/', getPhotos)
router.get('/:id', getPhotoById)

// Rutas protegidas (Admin)
router.post('/', verifyToken, requireRole('admin'), createPhoto)
router.put('/:id', verifyToken, requireRole('admin'), updatePhoto)
router.delete('/:id', verifyToken, requireRole('admin'), deletePhoto)

export default router
