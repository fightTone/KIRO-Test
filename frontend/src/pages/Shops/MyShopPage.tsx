import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { getMyShop } from '../../services/shopManagementService';
import { getShopProducts } from '../../services/productManagementService';
import { Shop, Product } from '../../types';
import './MyShopPage.css';

const MyShopPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShopData = async () => {
      try {
        setIsLoading(true);
        const shopData = await getMyShop();
        setShop(shopData);
        
        if (shopData) {
          const productsData = await getShopProducts(shopData.id);
          setProducts(productsData);
        }
      } catch (err) {
        console.error('Error loading shop data:', err);
        setError('Failed to load shop data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role.toLowerCase() === 'shop_owner') {
      loadShopData();
    }
  }, [user]);

  // Redirect if not a shop owner
  if (user && user.role.toLowerCase() !== 'shop_owner') {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="my-shop-page">
      <h1>My Shop</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {!shop ? (
        <div className="no-shop-container">
          <div className="no-shop-message">
            <h2>You don't have a shop yet</h2>
            <p>Create your shop to start selling products in the city.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/shop-management')}
            >
              Create Shop
            </button>
          </div>
        </div>
      ) : (
        <div className="shop-dashboard">
          <div className="shop-overview">
            <div className="shop-header">
              <div className="shop-image">
                {shop.image_url ? (
                  <img src={shop.image_url} alt={shop.name} />
                ) : (
                  <div className="placeholder-image">🏪</div>
                )}
              </div>
              <div className="shop-details">
                <h2>{shop.name}</h2>
                <p className="shop-description">{shop.description || 'No description available.'}</p>
                <div className="shop-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/shop-management')}
                  >
                    Edit Shop
                  </button>
                  <Link to={`/shops/${shop.id}`} className="btn btn-secondary">
                    View Public Page
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="shop-stats">
              <div className="stat-card">
                <h3>Products</h3>
                <div className="stat-value">{products.length}</div>
              </div>
              <div className="stat-card">
                <h3>Orders</h3>
                <div className="stat-value">
                  <Link to="/orders">View Orders</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="products-section">
            <div className="section-header">
              <h2>Products</h2>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/product-management')}
              >
                Manage Products
              </button>
            </div>
            
            {products.length === 0 ? (
              <div className="no-products-message">
                <p>You don't have any products yet.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/product-management')}
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="products-preview">
                {products.slice(0, 4).map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className="placeholder-image">📦</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-price">${product.price.toFixed(2)}</p>
                      <div className="product-stock">
                        <span className={`stock-status ${product.is_available ? 'in-stock' : 'out-of-stock'}`}>
                          {product.is_available ? 'Available' : 'Not Available'}
                        </span>
                        <span className="stock-quantity">{product.stock_quantity} in stock</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {products.length > 4 && (
                  <div className="more-products">
                    <Link to="/product-management">View all {products.length} products</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShopPage;