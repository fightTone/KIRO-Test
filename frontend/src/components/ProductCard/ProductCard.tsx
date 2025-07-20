import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import LazyImage from '../LazyImage/LazyImage';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-image-container">
          <LazyImage 
            src={product.image_url || defaultImage} 
            alt={product.name} 
            className="product-card-image"
            placeholderSrc="/assets/product-placeholder.png"
          />
          {!product.is_available && (
            <div className="product-card-out-of-stock">Out of Stock</div>
          )}
        </div>
        
        <div className="product-card-content">
          <h3 className="product-card-name">{product.name}</h3>
          <div className="product-card-price">${product.price.toFixed(2)}</div>
          
          {product.description && (
            <p className="product-card-description">
              {product.description.length > 60 
                ? `${product.description.substring(0, 60)}...` 
                : product.description}
            </p>
          )}
        </div>
      </Link>
      
      {product.is_available && product.stock_quantity > 0 && (
        <div className="product-card-actions">
          <button className="product-card-add-to-cart">
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;