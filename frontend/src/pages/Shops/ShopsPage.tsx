import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getShops, getCategories } from '../../services/shopService';
import { Shop, Category } from '../../types';
import { ShopCard } from '../../components';

const ShopsPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('category') ? Number(searchParams.get('category')) : undefined;

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadShops = async () => {
      try {
        setIsLoading(true);
        const data = await getShops(selectedCategoryId);
        setShops(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load shops:', err);
        setError('Failed to load shops. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadShops();
  }, [selectedCategoryId]);

  const handleCategoryChange = (categoryId?: number) => {
    if (categoryId) {
      setSearchParams({ category: categoryId.toString() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="shops-page">
      <div className="page-header">
        <h1>Browse Shops</h1>
        <p className="lead">Discover local shops in your city</p>
      </div>

      <div className="category-filter">
        <h2>Filter by Category</h2>
        <div className="category-buttons">
          <button 
            className={`category-btn ${!selectedCategoryId ? 'active' : ''}`}
            onClick={() => handleCategoryChange(undefined)}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategoryId === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="shops-container">
        {isLoading ? (
          <div className="loading">Loading shops...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            {shops.length > 0 ? (
              <div className="shop-grid">
                {shops.map(shop => (
                  <ShopCard 
                    key={shop.id} 
                    shop={shop} 
                    showDescription={true}
                    showAddress={true}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No shops found{selectedCategoryId ? ' in this category' : ''}.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopsPage;