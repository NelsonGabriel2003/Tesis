/**
 * useProductController
 * Controlador para gestión de productos en el panel admin
 */

import { useState, useCallback, useEffect } from 'react'
import { productService } from '../../services/admin/adminServices'
import { initialProductState, initialProductForm, adminMessages, reglasProducto } from '../../models/admin/adminModel'
import { useFormValidation } from '../../hooks/useFormValidation'

export const useProductController = () => {
  const [state, setState] = useState(initialProductState)
  const [formData, setFormData] = useState(initialProductForm)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [notification, setNotification] = useState(null)
  const { fieldErrors, tieneErrores, validarCampo, validarFormulario, limpiarErrores } = useFormValidation(reglasProducto)

  /**
   * Cargar todos los productos
   */
  const loadProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const products = await productService.getAll()
      setState(prev => ({
        ...prev,
        products,
        totalProducts: products.length,
        loading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [])

  /**
   * Cargar categorías
   */
  const loadCategories = useCallback(async () => {
    try {
      const categories = await productService.getCategories()
      setState(prev => ({ ...prev, categories }))
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }, [])

  /**
   * Cargar datos al montar
   */
  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [loadProducts, loadCategories])

  /**
   * Manejar cambios en el formulario
   */
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
    validarCampo(name, newValue)
  }, [validarCampo])

  /**
   * Abrir modal para crear
   */
  const openCreateModal = useCallback(() => {
    setFormData(initialProductForm)
    limpiarErrores()
    setIsEditing(false)
    setIsModalOpen(true)
  }, [limpiarErrores])

  /**
   * Abrir modal para editar
   */
  const openEditModal = useCallback((product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      points_earned: product.pointsEarned?.toString() || '',
      category: product.category || '',
      image_url: product.imageUrl || ''
    })
    limpiarErrores()
    setState(prev => ({ ...prev, selectedProduct: product }))
    setIsEditing(true)
    setIsModalOpen(true)
  }, [limpiarErrores])

  /**
   * Cerrar modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setFormData(initialProductForm)
    setState(prev => ({ ...prev, selectedProduct: null }))
  }, [])

  /**
   * Mostrar notificación
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  /**
   * Guardar producto (crear o actualizar)
   */
  const saveProduct = useCallback(async (e) => {
    e.preventDefault()

    // Validar formulario completo
    if (!validarFormulario(formData)) {
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        points_earned: parseInt(formData.points_earned) || Math.floor(parseFloat(formData.price)),
        category: formData.category,
        image_url: formData.image_url
      }

      if (isEditing && state.selectedProduct) {
        await productService.update(state.selectedProduct.id, productData)
        showNotification(adminMessages.PRODUCT_UPDATED)
      } else {
        await productService.create(productData)
        showNotification(adminMessages.PRODUCT_CREATED)
      }

      closeModal()
      loadProducts()
    } catch (error) {
      showNotification(error.message || adminMessages.PRODUCT_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [formData, isEditing, state.selectedProduct, closeModal, loadProducts, showNotification])

  /**
   * Eliminar producto
   */
  const deleteProduct = useCallback(async (id) => {
    if (!window.confirm(adminMessages.CONFIRM_DELETE)) {
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      await productService.delete(id)
      showNotification(adminMessages.PRODUCT_DELETED)
      loadProducts()
    } catch (error) {
      showNotification(error.message || adminMessages.PRODUCT_ERROR, 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [loadProducts, showNotification])

  /**
   * Buscar productos
   */
  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) {
      loadProducts()
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      const products = await productService.search(query)
      setState(prev => ({ ...prev, products, loading: false, error: null }))
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
    }
  }, [loadProducts])

  return {
    // Estado
    ...state,
    formData,
    isModalOpen,
    isEditing,
    notification,
    fieldErrors,
    tieneErrores,

    // Acciones
    loadProducts,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeModal,
    saveProduct,
    deleteProduct,
    searchProducts
  }
}
