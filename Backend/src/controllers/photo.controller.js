/**
 * Photo Controller
 * Maneja operaciones de fotos/eventos
 */

import PhotoModel from '../models/photo.model.js'
import cloudinary from '../config/cloudinary.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener todas las fotos activas (publico)
 * GET /api/photos
 */
const getPhotos = asyncHandler(async (req, res) => {
  const photos = await PhotoModel.findAll()

  res.json({
    success: true,
    count: photos.length,
    data: photos.map(photo => ({
      id: photo.id,
      title: photo.title,
      description: photo.description,
      imageUrl: photo.image_url
    }))
  })
})

/**
 * Obtener todas las fotos (Admin)
 * GET /api/photos/admin
 */
const getPhotosAdmin = asyncHandler(async (req, res) => {
  const photos = await PhotoModel.findAllAdmin()

  res.json({
    success: true,
    count: photos.length,
    data: photos.map(photo => ({
      id: photo.id,
      title: photo.title,
      description: photo.description,
      imageUrl: photo.image_url,
      cloudinaryPublicId: photo.cloudinary_public_id,
      isActive: photo.is_active
    }))
  })
})

/**
 * Obtener foto por ID
 * GET /api/photos/:id
 */
const getPhotoById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const photo = await PhotoModel.findById(id)

  if (!photo) {
    return res.status(404).json({
      success: false,
      message: 'Foto no encontrada'
    })
  }

  res.json({
    success: true,
    data: {
      id: photo.id,
      title: photo.title,
      description: photo.description,
      imageUrl: photo.image_url,
      isActive: photo.is_active
    }
  })
})

/**
 * Crear foto (Admin)
 * POST /api/photos
 */
const createPhoto = asyncHandler(async (req, res) => {
  const { title, description, image_url, cloudinary_public_id } = req.body

  if (!title || !image_url) {
    return res.status(400).json({
      success: false,
      message: 'Titulo e imagen son requeridos'
    })
  }

  const photo = await PhotoModel.create({
    title,
    description,
    image_url,
    cloudinary_public_id
  })

  res.status(201).json({
    success: true,
    message: 'Foto creada exitosamente',
    data: photo
  })
})

/**
 * Actualizar foto (Admin)
 * PUT /api/photos/:id
 */
const updatePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params
  const photoData = req.body

  const photo = await PhotoModel.update(id, photoData)

  if (!photo) {
    return res.status(404).json({
      success: false,
      message: 'Foto no encontrada'
    })
  }

  res.json({
    success: true,
    message: 'Foto actualizada',
    data: photo
  })
})

/**
 * Eliminar foto (Admin)
 * DELETE /api/photos/:id
 */
const deletePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Obtener foto para eliminar imagen de Cloudinary
  const photo = await PhotoModel.findById(id)

  if (!photo) {
    return res.status(404).json({
      success: false,
      message: 'Foto no encontrada'
    })
  }

  // Eliminar imagen de Cloudinary si tiene publicId
  if (photo.cloudinary_public_id) {
    try {
      await cloudinary.uploader.destroy(photo.cloudinary_public_id)
    } catch (error) {
      console.error('Error eliminando imagen de Cloudinary:', error)
    }
  }

  // Eliminar de la base de datos
  await PhotoModel.delete(id)

  res.json({
    success: true,
    message: 'Foto eliminada'
  })
})

export {
  getPhotos,
  getPhotosAdmin,
  getPhotoById,
  createPhoto,
  updatePhoto,
  deletePhoto
}
