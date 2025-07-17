import React from 'react';
import { Layout } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const MyShopPage: React.FC = () => {
  const { user } = useAuth();

  // Redirect if not a shop owner
  if (user && user.role !== 'shop_owner') {
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <h1>My Shop</h1>
      <p>Manage your shop</p>
      {/* Shop management will be implemented in a future task */}
    </Layout>
  );
};

export default MyShopPage;