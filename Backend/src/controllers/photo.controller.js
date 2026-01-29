/**
 * Photo Controller
 * Maneja operaciones de fotos/eventos
 */

import FotoModel from '../models/foto.model.js'
import cloudinary from '../config/cloudinary.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener todas las fotos activas (publico)
 * GET /api/photos
 */
const getPhotos = asyncHandler(async (req, res) => {
  const fotos = await FotoModel.obtenerTodas()

  res.json({
    success: true,
    count: fotos.length,
    data: fotos.map(foto => ({
      id: foto.id,
      title: foto.titulo,
      description: foto.descripcion,
      imageUrl: foto.imagen_url
    }))
  })
})

/**
 * Obtener todas las fotos (Admin)
 * GET /api/photos/admin
 */
const getPhotosAdmin = asyncHandler(async (req, res) => {
  const fotos = await FotoModel.obtenerTodasAdmin()

  res.json({
    success: true,
    count: fotos.length,
    data: fotos.map(foto => ({
      id: foto.id,
      title: foto.titulo,
      description: foto.descripcion,
      imageUrl: foto.imagen_url,
      cloudinaryPublicId: foto.cloudinary_public_id,
      isActive: foto.activa
    }))
  })
})

/**
 * Obtener foto por ID
 * GET /api/photos/:id
 */
const getPhotoById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const foto = await FotoModel.buscarPorId(id)

  if (!foto) {
    return res.status(404).json({
      success: false,
      message: 'Foto no encontrada'
    })
  }

  res.json({
    success: true,
    data: {
      id: foto.id,
      title: foto.titulo,
      description: foto.descripcion,
      imageUrl: foto.imagen_url,
      isActive: foto.activa
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

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const foto = await FotoModel.crear({
    titulo: title,
    descripcion: description,
    imagen_url: image_url,
    cloudinary_public_id
  }, req.user?.id, infoSolicitud)

  res.status(201).json({
    success: true,
    message: 'Foto creada exitosamente',
    data: foto
  })
})

/**
 * Actualizar foto (Admin)
 * PUT /api/photos/:id
 */
const updatePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title, description, image_url, cloudinary_public_id, is_active } = req.body

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const foto = await FotoModel.actualizar(id, {
    titulo: title,
    descripcion: description,
    imagen_url: image_url,
    cloudinary_public_id,
    activa: is_active
  }, req.user?.id, infoSolicitud)

  if (!foto) {
    return res.status(404).json({
      success: false,
      message: 'Foto no encontrada'
    })
  }

  res.json({
    success: true,
    message: 'Foto actualizada',
    data: foto
  })
})

/**
 * Eliminar foto (Admin)
 * DELETE /api/photos/:id
 */
const deletePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Obtener foto para eliminar imagen de Cloudinary
  const foto = await FotoModel.buscarPorId(id)

  if (!foto) {
    return res.status(404).json({
      success: false,
      message: 'Foto no encontrada'
    })
  }

  // Eliminar imagen de Cloudinary si tiene publicId
  if (foto.cloudinary_public_id) {
    try {
      await cloudinary.uploader.destroy(foto.cloudinary_public_id)
    } catch (error) {
      console.error('Error eliminando imagen de Cloudinary:', error)
    }
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  // Eliminar de la base de datos
  await FotoModel.eliminar(id, req.user?.id, infoSolicitud)

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
