import React from 'react';
import { Link } from 'react-router-dom';
import { Shop } from '../../types';

interface ShopCardProps {
  shop: Shop;
  showDescription?: boolean;
  showAddress?: boolean;
}

const ShopCard: React.FC<ShopCardProps> = ({ 
  shop, 
  showDescription = true, 
  showAddress = true 
}) => {
  return (
    <div className="shop-card">
      <div className="shop-image">
        {shop.image_url ? (
          <img src={shop.image_url} alt={shop.name} />
        ) : (
          <div className="placeholder-image">🏪</div>
        )}
      </div>
      <div className="shop-info">
        <h3>{shop.name}</h3>
        {showDescription && (
          <p className="shop-description">{shop.description || 'No description available'}</p>
        )}
        {showAddress && (
          <p className="shop-address">📍 {shop.address}</p>
        )}
        <Link to={`/shops/${shop.id}`} className="btn btn-primary btn-sm">View Shop</Link>
      </div>
    </div>
  );
};

export default ShopCard;