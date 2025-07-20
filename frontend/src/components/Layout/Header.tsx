import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { ThemeToggle } from '../ThemeToggle';
import CartIcon from '../CartIcon';
import './Header.css';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownActive, setDropdownActive] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  
  // Debug user role
  console.log('Header - User:', user);
  console.log('Header - isAuthenticated:', isAuthenticated);
  console.log('Header - User role:', user?.role);

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownActive(false);
      }
    };

    // Add event listener when dropdown is active
    if (dropdownActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownActive]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setDropdownActive(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownActive(!dropdownActive);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setDropdownActive(false);
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
                {user && user.role.toLowerCase() === 'shop_owner' ? (
                  <>
                    <li ref={dropdownRef} className={`dropdown ${dropdownActive ? 'active' : ''}`}>
                      <span className="dropdown-toggle" onClick={toggleDropdown}>My Shop</span>
                      <ul className="dropdown-menu">
                        <li>
                          <Link to="/my-shop" onClick={closeMobileMenu}>Dashboard</Link>
                        </li>
                        <li>
                          <Link to="/shop-management" onClick={closeMobileMenu}>Edit Shop</Link>
                        </li>
                        <li>
                          <Link to="/product-management" onClick={closeMobileMenu}>Manage Products</Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <Link to="/orders" onClick={closeMobileMenu}>Orders</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <CartIcon onClick={closeMobileMenu} />
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