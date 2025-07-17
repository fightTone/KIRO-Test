import React from 'react';
import { useParams } from 'react-router-dom';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div>
      <h1>Order Details</h1>
      <p>Order ID: {orderId}</p>
      {/* Order details will be implemented in a future task */}
    </div>
  );
};

export default OrderDetailPage;