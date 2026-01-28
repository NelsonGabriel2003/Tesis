/**
 * Product Controller
 * Maneja operaciones del menú de productos
 */

import ProductModel from '../models/product.model.js'
import { asyncHandler } from '../middlewares/index.js'

/**
 * Obtener todos los productos
 * GET /api/products
 * Query params: ?category=bebidas
 */
const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query
  
  const products = await ProductModel.findAll(category)

  res.json({
    success: true,
    count: products.length,
    data: products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      pointsEarned: product.points_earned,
      category: product.category,
      imageUrl: product.image_url
    }))
  })
})

/**
 * Obtener producto por ID
 * GET /api/products/:id
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const product = await ProductModel.findById(id)

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    })
  }

  res.json({
    success: true,
    data: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      pointsEarned: product.points_earned,
      category: product.category,
      imageUrl: product.image_url,
      isAvailable: product.is_available
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
      message: 'El término de búsqueda debe tener al menos 2 caracteres'
    })
  }

  const products = await ProductModel.search(q)

  res.json({
    success: true,
    count: products.length,
    data: products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      pointsEarned: product.points_earned,
      category: product.category,
      imageUrl: product.image_url
    }))
  })
})

/**
 * Obtener categorías disponibles
 * GET /api/products/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await ProductModel.getCategories()

  res.json({
    success: true,
    data: categories
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
      message: 'Nombre, precio y categoría son requeridos'
    })
  }

  const product = await ProductModel.create({
    name,
    description,
    price,
    points_earned: points_earned || Math.floor(price),
    category,
    image_url
  })

  res.status(201).json({
    success: true,
    message: 'Producto creado exitosamente',
    data: product
  })
})

/**
 * Actualizar producto (Admin)
 * PUT /api/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params
  const productData = req.body

  const product = await ProductModel.update(id, productData)

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    })
  }

  res.json({
    success: true,
    message: 'Producto actualizado',
    data: product
  })
})

/**
 * Eliminar producto (Admin - soft delete)
 * DELETE /api/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params

  const product = await ProductModel.delete(id)

  if (!product) {
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
