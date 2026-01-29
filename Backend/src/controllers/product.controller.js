/**
 * Product Controller
 * Maneja operaciones del menu de productos
 */

import ProductoModel from '../models/producto.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener todos los productos
 * GET /api/products
 */
const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query

  const productos = await ProductoModel.obtenerTodos(category)

  res.json({
    success: true,
    count: productos.length,
    data: productos.map(producto => ({
      id: producto.id,
      name: producto.nombre,
      description: producto.descripcion,
      price: parseFloat(producto.precio),
      pointsEarned: producto.puntos_otorgados,
      category: producto.categoria,
      imageUrl: producto.imagen_url
    }))
  })
})

/**
 * Obtener producto por ID
 * GET /api/products/:id
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const producto = await ProductoModel.buscarPorId(id)

  if (!producto) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    })
  }

  res.json({
    success: true,
    data: {
      id: producto.id,
      name: producto.nombre,
      description: producto.descripcion,
      price: parseFloat(producto.precio),
      pointsEarned: producto.puntos_otorgados,
      category: producto.categoria,
      imageUrl: producto.imagen_url,
      isAvailable: producto.disponible
    }
  })
})

/**
 * Buscar productos
 * GET /api/products/search?q=cerveza
 */
const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query

  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'El termino de busqueda debe tener al menos 2 caracteres'
    })
  }

  const productos = await ProductoModel.buscar(q)

  res.json({
    success: true,
    count: productos.length,
    data: productos.map(producto => ({
      id: producto.id,
      name: producto.nombre,
      description: producto.descripcion,
      price: parseFloat(producto.precio),
      pointsEarned: producto.puntos_otorgados,
      category: producto.categoria,
      imageUrl: producto.imagen_url
    }))
  })
})

/**
 * Obtener categorias disponibles
 * GET /api/products/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categorias = await ProductoModel.obtenerCategorias()

  res.json({
    success: true,
    data: categorias
  })
})

/**
 * Crear producto (Admin)
 * POST /api/products
 */
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, points_earned, category, image_url } = req.body

  if (!name || !price || !category) {
    return res.status(400).json({
      success: false,
      message: 'Nombre, precio y categoria son requeridos'
    })
  }

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const producto = await ProductoModel.crear({
    nombre: name,
    descripcion: description,
    precio: price,
    puntos_otorgados: points_earned || Math.floor(price),
    categoria: category,
    imagen_url: image_url
  }, req.user?.id, infoSolicitud)

  res.status(201).json({
    success: true,
    message: 'Producto creado exitosamente',
    data: producto
  })
})

/**
 * Actualizar producto (Admin)
 * PUT /api/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, description, price, points_earned, category, image_url, is_available } = req.body

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const producto = await ProductoModel.actualizar(id, {
    nombre: name,
    descripcion: description,
    precio: price,
    puntos_otorgados: points_earned,
    categoria: category,
    imagen_url: image_url,
    disponible: is_available
  }, req.user?.id, infoSolicitud)

  if (!producto) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    })
  }

  res.json({
    success: true,
    message: 'Producto actualizado',
    data: producto
  })
})

/**
 * Eliminar producto (Admin - soft delete)
 * DELETE /api/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  const infoSolicitud = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  }

  const producto = await ProductoModel.eliminar(id, req.user?.id, infoSolicitud)

  if (!producto) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    })
  }

  res.json({
    success: true,
    message: 'Producto eliminado'
  })
})

export {
  getProducts,
  getProductById,
  searchProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
}
