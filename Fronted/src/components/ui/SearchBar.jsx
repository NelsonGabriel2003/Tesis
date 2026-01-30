/**
 * SearchBar Component
 * Barra de búsqueda reutilizable con contador de resultados
 *
 * Props:
 * - value: string - Valor actual de la búsqueda
 * - onChange: (value: string) => void - Callback al cambiar el valor
 * - placeholder: string - Placeholder del input
 * - resultsCount: number - Cantidad de resultados actuales
 * - totalCount: number - Total de elementos en la BD
 */

import { Search } from 'lucide-react'

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  resultsCount = 0,
  totalCount = 0
}) => {
  const isFiltering = value.trim().length > 0

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Input de búsqueda */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-all duration-200"
        />
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
        <span className="text-sm text-gray-500">
          {isFiltering ? 'Resultados:' : 'Total:'}
        </span>
        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1
          text-sm font-semibold text-white bg-purple-600 rounded-full">
          {resultsCount}
        </span>
        {isFiltering && totalCount > 0 && (
          <>
            <span className="text-sm text-gray-400">de</span>
            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1
              text-sm font-medium text-purple-600 bg-purple-100 rounded-full">
              {totalCount}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchBar
