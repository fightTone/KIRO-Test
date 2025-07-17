import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { ThemeToggle } from '../ThemeToggle';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">City Shops Platform</Link>
        </div>
        
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-icon">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </span>
        </button>
        
        <nav className={`nav ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <ul>
            <li>
              <Link to="/" onClick={closeMobileMenu}>Home</Link>
            </li>
            <li>
              <Link to="/shops" onClick={closeMobileMenu}>Shops</Link>
            </li>
            <li>
              <Link to="/products" onClick={closeMobileMenu}>Products</Link>
            </li>
            {isAuthenticated ? (
              <>
                {user?.role === 'shop_owner' ? (
                  <>
                    <li>
                      <Link to="/my-shop" onClick={closeMobileMenu}>My Shop</Link>
                    </li>
                    <li>
                      <Link to="/orders" onClick={closeMobileMenu}>Orders</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/cart" onClick={closeMobileMenu}>Cart</Link>
                    </li>
                    <li>
                      <Link to="/orders" onClick={closeMobileMenu}>My Orders</Link>
                    </li>
                  </>
                )}
                <li>
                  <Link to="/profile" onClick={closeMobileMenu}>Profile</Link>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }} 
                    className="logout-btn"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" onClick={closeMobileMenu}>Login</Link>
                </li>
                <li>
                  <Link to="/register" onClick={closeMobileMenu}>Register</Link>
                </li>
              </>
            )}
            <li className="theme-toggle-container">
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;