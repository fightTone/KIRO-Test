import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, Shop } from '../../types';
import { getProduct } from '../../services/productService';
import './ProductDetailPage.css';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        const productData = await getProduct(parseInt(productId));
        setProduct(productData);
        
        // In a real implementation, we would fetch the shop details here
        // For now, we'll just use a placeholder
        setShop({
          id: productData.shop_id,
          name: 'Shop information will be loaded in a future task',
          owner_id: 1,
          category_id: productData.category_id,
          address: 'Shop address',
          is_active: true,
          created_at: new Date().toISOString()
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-spinner">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-message">
          {error || 'Product not found'}
        </div>
        <Link to="/products" className="back-link">Back to Products</Link>
      </div>
    );
  }

  const defaultImage = 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="product-detail-page">
      <div className="product-detail-breadcrumb">
        <Link to="/products">Products</Link> / {product.name}
      </div>
      
      <div className="product-detail-container">
        <div className="product-detail-image-container">
          <img 
            src={product.image_url || defaultImage} 
            alt={product.name} 
            className="product-detail-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = defaultImage;
            }}
          />
        </div>
        
        <div className="product-detail-info">
          <h1 className="product-detail-name">{product.name}</h1>
          
          <div className="product-detail-price-container">
            <span className="product-detail-price">${product.price.toFixed(2)}</span>
            {!product.is_available && (
              <span className="product-detail-out-of-stock">Out of Stock</span>
            )}
          </div>
          
          {product.description && (
            <div className="product-detail-description">
              <h2>Description</h2>
              <p>{product.description}</p>
            </div>
          )}
          
          <div className="product-detail-shop">
            <h2>Sold by</h2>
            {shop && (
              <Link to={`/shops/${shop.id}`} className="shop-link">
                {shop.name}
              </Link>
            )}
          </div>
          
          {product.is_available && product.stock_quantity > 0 && (
            <div className="product-detail-actions">
              <button className="add-to-cart-button">
                Add to Cart
              </button>
              <div className="product-detail-stock">
                {product.stock_quantity} in stock
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;