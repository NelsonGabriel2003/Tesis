/**
 * ImageUpload Component
 * Componente reutilizable para subir imágenes
 */

import { useState, useRef } from 'react'
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react'
import { uploadService } from '../../services/admin/adminServices'

const ImageUpload = ({ value, onChange, onError }) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || null)
  const fileInputRef = useRef(null)

  // Manejar selección de archivo
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      onError?.('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError?.('La imagen no debe superar 5MB')
      return
    }

    // Mostrar preview local mientras sube
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setUploading(true)

    try {
      const result = await uploadService.uploadImage(file)
      setPreview(result.data.url)
      onChange?.(result.data.url)
    } catch (error) {
      setPreview(value || null)
      onError?.(error.message || 'Error al subir imagen')
    } finally {
      setUploading(false)
      // Limpiar el input para permitir subir la misma imagen de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Eliminar imagen
  const handleRemove = () => {
    setPreview(null)
    onChange?.('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Abrir selector de archivos
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview o Placeholder */}
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          
          {/* Overlay con acciones */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
            transition-opacity rounded-lg flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              disabled={uploading}
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              title="Cambiar imagen"
            >
              <Upload size={20} className="text-gray-700" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              title="Eliminar imagen"
            >
              <X size={20} className="text-red-500" />
            </button>
          </div>

          {/* Loading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader className="animate-spin text-white" size={32} />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg
            flex flex-col items-center justify-center gap-2
            hover:border-purple-500 hover:bg-purple-50 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader className="animate-spin text-purple-500" size={32} />
              <span className="text-sm text-gray-500">Subiendo...</span>
            </>
          ) : (
            <>
              <ImageIcon size={32} className="text-gray-400" />
              <span className="text-sm text-gray-500">Click para subir imagen</span>
              <span className="text-xs text-gray-400">JPEG, PNG, GIF, WebP (máx 5MB)</span>
            </>
          )}
        </button>
      )}

      {/* Input URL alternativo */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">o</span>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => {
            const url = e.target.value
            setPreview(url || null)
            onChange?.(url)
          }}
          placeholder="Pegar URL de imagen"
          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}

export default ImageUpload
