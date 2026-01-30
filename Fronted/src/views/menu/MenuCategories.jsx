/**
 * MenuCategories Component
 * Barra de categorías del menú
 */

const MenuCategories = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            selectedCategory === category.id
              ? 'bg-primary text-white shadow-md'
              : 'bg-surface-primary text-text-secondary hover:bg-surface-secondary'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}

export default MenuCategories
