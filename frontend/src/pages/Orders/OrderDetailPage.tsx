import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../../components';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <Layout>
      <h1>Order Details</h1>
      <p>Order ID: {orderId}</p>
      {/* Order details will be implemented in a future task */}
    </Layout>
  );
};

export default OrderDetailPage;