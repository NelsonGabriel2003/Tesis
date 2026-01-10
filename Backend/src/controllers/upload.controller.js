/**
 * Upload Controller
 * Maneja la subida de imágenes a Cloudinary
 */

import cloudinary from '../config/cloudinary.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Subir imagen a Cloudinary
 * POST /api/upload/image
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se recibió ninguna imagen'
    })
  }

  try {
    // Convertir buffer a base64
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'bar-bounty',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    })

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    })
  } catch (error) {
    console.error('Error subiendo imagen:', error)
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen'
    })
  }
})

/**
 * Eliminar imagen de Cloudinary
 * DELETE /api/upload/image/:publicId
 */
const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params

  if (!publicId) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere el publicId de la imagen'
    })
  }

  try {
    // El publicId viene codificado, hay que decodificarlo
    const decodedPublicId = decodeURIComponent(publicId)
    
    const result = await cloudinary.uploader.destroy(decodedPublicId)

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      })
    }
  } catch (error) {
    console.error('Error eliminando imagen:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen'
    })
  }
})

export {
  uploadImage,
  deleteImage
}
