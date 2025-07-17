import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../../components';

const ShopDetailPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();

  return (
    <Layout>
      <h1>Shop Details</h1>
      <p>Shop ID: {shopId}</p>
      {/* Shop details will be implemented in a future task */}
    </Layout>
  );
};

export default ShopDetailPage;