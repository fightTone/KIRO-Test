import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShopById } from '../../services/shopService';
import { Shop } from '../../types';

const ShopDetailPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShopDetails = async () => {
      if (!shopId) return;
      
      try {
        setIsLoading(true);
        const data = await getShopById(parseInt(shopId));
        setShop(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load shop details:', err);
        setError('Failed to load shop details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadShopDetails();
  }, [shopId]);

  if (isLoading) {
    return <div className="loading">Loading shop details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!shop) {
    return <div className="not-found">Shop not found</div>;
  }

  return (
    <div className="shop-detail-page">
      <div className="shop-header">
        <Link to="/shops" className="back-link">← Back to Shops</Link>
        <h1>{shop.name}</h1>
      </div>

      <div className="shop-content">
        <div className="shop-main-info">
          <div className="shop-image-container">
            {shop.image_url ? (
              <img src={shop.image_url} alt={shop.name} className="shop-image" />
            ) : (
              <div className="placeholder-image large">🏪</div>
            )}
          </div>

          <div className="shop-details">
            <div className="detail-section">
              <h2>About</h2>
              <p>{shop.description || 'No description available.'}</p>
            </div>

            <div className="detail-section">
              <h2>Contact Information</h2>
              <p><strong>Address:</strong> {shop.address}</p>
              {shop.phone && <p><strong>Phone:</strong> {shop.phone}</p>}
              {shop.email && <p><strong>Email:</strong> {shop.email}</p>}
            </div>

            <div className="shop-actions">
              <Link to={`/products?shop=${shop.id}`} className="btn btn-primary">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailPage;