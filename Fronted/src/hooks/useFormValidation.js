/**
 * useFormValidation
 * Hook genérico para validación de formularios admin
 * Recibe reglas de validación y retorna errores + funciones de validación
 */

import { useState, useCallback } from 'react'

export const useFormValidation = (reglas) => {
  const [fieldErrors, setFieldErrors] = useState({})

  /**
   * Validar un campo individual
   * @param {string} nombre - nombre del campo
   * @param {*} valor - valor actual del campo
   * @returns {string} mensaje de error o cadena vacía
   */
  const validarCampo = useCallback((nombre, valor) => {
    const regla = reglas[nombre]
    if (!regla) return ''

    const valorStr = valor?.toString().trim() ?? ''

    // Requerido
    if (regla.requerido && !valorStr) {
      const error = regla.mensajes?.requerido || `Este campo es requerido`
      setFieldErrors(prev => ({ ...prev, [nombre]: error }))
      return error
    }

    // Si no es requerido y está vacío, no validar más
    if (!valorStr) {
      setFieldErrors(prev => ({ ...prev, [nombre]: '' }))
      return ''
    }

    // Longitud mínima
    if (regla.min !== undefined && valorStr.length < regla.min) {
      const error = regla.mensajes?.min || `Mínimo ${regla.min} caracteres`
      setFieldErrors(prev => ({ ...prev, [nombre]: error }))
      return error
    }

    // Longitud máxima
    if (regla.max !== undefined && valorStr.length > regla.max) {
      const error = regla.mensajes?.max || `Máximo ${regla.max} caracteres`
      setFieldErrors(prev => ({ ...prev, [nombre]: error }))
      return error
    }

    // Validación numérica
    if (regla.tipo === 'numero') {
      const num = parseFloat(valor)
      if (isNaN(num)) {
        const error = regla.mensajes?.tipo || 'Debe ser un número válido'
        setFieldErrors(prev => ({ ...prev, [nombre]: error }))
        return error
      }
      if (regla.mayorQue !== undefined && num <= regla.mayorQue) {
        const error = regla.mensajes?.mayorQue || `Debe ser mayor que ${regla.mayorQue}`
        setFieldErrors(prev => ({ ...prev, [nombre]: error }))
        return error
      }
      if (regla.minValor !== undefined && num < regla.minValor) {
        const error = regla.mensajes?.minValor || `Debe ser al menos ${regla.minValor}`
        setFieldErrors(prev => ({ ...prev, [nombre]: error }))
        return error
      }
    }

    // Sin error
    setFieldErrors(prev => ({ ...prev, [nombre]: '' }))
    return ''
  }, [reglas])

  /**
   * Validar todo el formulario
   * @param {Object} formData - datos del formulario
   * @returns {boolean} true si es válido
   */
  const validarFormulario = useCallback((formData) => {
    const errores = {}
    let esValido = true

    for (const [nombre, regla] of Object.entries(reglas)) {
      const valor = formData[nombre]
      const valorStr = valor?.toString().trim() ?? ''

      // Requerido
      if (regla.requerido && !valorStr) {
        errores[nombre] = regla.mensajes?.requerido || 'Este campo es requerido'
        esValido = false
        continue
      }

      if (!valorStr) continue

      // Longitud mínima
      if (regla.min !== undefined && valorStr.length < regla.min) {
        errores[nombre] = regla.mensajes?.min || `Mínimo ${regla.min} caracteres`
        esValido = false
        continue
      }

      // Longitud máxima
      if (regla.max !== undefined && valorStr.length > regla.max) {
        errores[nombre] = regla.mensajes?.max || `Máximo ${regla.max} caracteres`
        esValido = false
        continue
      }

      // Validación numérica
      if (regla.tipo === 'numero') {
        const num = parseFloat(valor)
        if (isNaN(num)) {
          errores[nombre] = regla.mensajes?.tipo || 'Debe ser un número válido'
          esValido = false
          continue
        }
        if (regla.mayorQue !== undefined && num <= regla.mayorQue) {
          errores[nombre] = regla.mensajes?.mayorQue || `Debe ser mayor que ${regla.mayorQue}`
          esValido = false
          continue
        }
        if (regla.minValor !== undefined && num < regla.minValor) {
          errores[nombre] = regla.mensajes?.minValor || `Debe ser al menos ${regla.minValor}`
          esValido = false
          continue
        }
      }
    }

    setFieldErrors(errores)
    return esValido
  }, [reglas])

  /**
   * Limpiar todos los errores
   */
  const limpiarErrores = useCallback(() => {
    setFieldErrors({})
  }, [])

  const tieneErrores = Object.values(fieldErrors).some(e => e)

  return { fieldErrors, tieneErrores, validarCampo, validarFormulario, limpiarErrores }
}
