import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <h1>Welcome to City Shops Platform</h1>
      <p>Discover local shops and products in your city</p>
      
      <section className="features">
        <div className="feature">
          <h2>Find Local Shops</h2>
          <p>Explore shops in your neighborhood and support local businesses</p>
        </div>
        
        <div className="feature">
          <h2>Order Online</h2>
          <p>Browse products and place orders for pickup or delivery</p>
        </div>
        
        <div className="feature">
          <h2>Shop Owner?</h2>
          <p>Register your shop and start selling your products online</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;