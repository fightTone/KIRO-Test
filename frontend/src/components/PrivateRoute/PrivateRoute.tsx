import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'shop_owner';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check if user has required role (if specified)
  if (requiredRole && user) {
    const userRole = user.role.toLowerCase();
    const requiredRoleLower = requiredRole.toLowerCase();
    
    if (userRole !== requiredRoleLower) {
      return <Navigate to="/" />;
    }
  }
  
  return <>{children}</>;
};

export default PrivateRoute;