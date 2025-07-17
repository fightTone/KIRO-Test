import React from 'react';
import { Layout } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { user } = useAuth();

  // Redirect if not a customer
  if (user && user.role !== 'customer') {
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <h1>Shopping Cart</h1>
      <p>Your cart items</p>
      {/* Cart management will be implemented in a future task */}
    </Layout>
  );
};

export default CartPage;