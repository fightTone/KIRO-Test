import React from 'react';
import { Category } from '../../types';
import './CategoryFilter.css';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory 
}) => {
  return (
    <div className="category-filter">
      <div className="category-filter-header">
        <h3>Categories</h3>
      </div>
      
      <div className="category-filter-list">
        <button 
          className={`category-filter-item ${selectedCategoryId === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          All Categories
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-filter-item ${selectedCategoryId === category.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;