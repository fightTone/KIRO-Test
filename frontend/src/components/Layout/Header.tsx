import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">City Shops Platform</Link>
        </div>
        <nav className="nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/shops">Shops</Link>
            </li>
            {isAuthenticated ? (
              <>
                {user?.role === 'shop_owner' && (
                  <li>
                    <Link to="/my-shop">My Shop</Link>
                  </li>
                )}
                <li>
                  <Link to="/cart">Cart</Link>
                </li>
                <li>
                  <Link to="/orders">Orders</Link>
                </li>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;