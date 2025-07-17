import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedShops } from '../../services/shopService';
import { Shop } from '../../types';
import { ShopCard } from '../../components';

const HomePage: React.FC = () => {
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedShops = async () => {
      try {
        setIsLoading(true);
        const shops = await getFeaturedShops(4);
        setFeaturedShops(shops);
        setError(null);
      } catch (err) {
        console.error('Failed to load featured shops:', err);
        setError('Failed to load featured shops. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedShops();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to City Shops Platform</h1>
        <p className="lead">Discover local shops and products in your city</p>
        <div className="hero-actions">
          <Link to="/shops" className="btn btn-primary">Browse All Shops</Link>
          <Link to="/products" className="btn btn-secondary">View Products</Link>
        </div>
      </section>
      
      <section className="features">
        <h2 className="section-title">How It Works</h2>
        <div className="feature-grid">
          <div className="feature">
            <div className="feature-icon">🏪</div>
            <h3>Find Local Shops</h3>
            <p>Explore shops in your neighborhood and support local businesses</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🛒</div>
            <h3>Order Online</h3>
            <p>Browse products and place orders for pickup or delivery</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🚀</div>
            <h3>Shop Owner?</h3>
            <p>Register your shop and start selling your products online</p>
          </div>
        </div>
      </section>

      <section className="featured-shops">
        <h2 className="section-title">Featured Shops</h2>
        {isLoading ? (
          <div className="loading">Loading featured shops...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="shop-grid">
            {featuredShops.length > 0 ? (
              featuredShops.map((shop) => (
                <ShopCard 
                  key={shop.id} 
                  shop={shop} 
                  showAddress={false}
                />
              ))
            ) : (
              <p>No featured shops available at the moment.</p>
            )}
          </div>
        )}
        <div className="view-all">
          <Link to="/shops" className="btn btn-outline">View All Shops</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;