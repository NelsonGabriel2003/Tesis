/**
 * Upload Routes
 * Rutas para subida de imágenes
 */

import { Router } from 'express'
import { uploadImage, deleteImage } from '../controllers/upload.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/index.js'
import upload from '../middlewares/upload.middleware.js'

const router = Router()

// Subir imagen (solo admin)
router.post('/image', verifyToken, verifyAdmin, upload.single('image'), uploadImage)

// Eliminar imagen (solo admin)
router.delete('/image/:publicId', verifyToken, verifyAdmin, deleteImage)

export default router
