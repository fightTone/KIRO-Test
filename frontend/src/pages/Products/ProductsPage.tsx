import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category } from '../../types';
import { getProducts, getCategories } from '../../services/productService';
import { ProductCard, CategoryFilter } from '../../components';
import './ProductsPage.css';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category')!) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(undefined, categoryId || undefined),
          getCategories()
        ]);
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);
  
  // Filter products when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleCategorySelect = (selectedCategoryId: number | null) => {
    if (selectedCategoryId) {
      setSearchParams({ category: selectedCategoryId.toString() });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return (
      <div className="products-page">
        <h1>Products</h1>
        <div className="loading-spinner">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <h1>Products</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <h1>Products</h1>
      <p>Browse products by category</p>
      
      <div className="products-search-filter-container">
        <div className="products-search-container">
          <input
            type="text"
            placeholder="Search products..."
            className="products-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="products-search-clear" 
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
      
      <CategoryFilter 
        categories={categories}
        selectedCategoryId={categoryId}
        onSelectCategory={handleCategorySelect}
      />
      
      {products.length === 0 ? (
        <div className="no-products-message">
          No products found. {categoryId ? 'Try selecting a different category.' : ''}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="no-products-message">
          No products match your search. Try different keywords or clear the search.
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-grid-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;