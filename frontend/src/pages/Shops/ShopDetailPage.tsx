import React from 'react';
import { useParams } from 'react-router-dom';

const ShopDetailPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();

  return (
    <div>
      <h1>Shop Details</h1>
      <p>Shop ID: {shopId}</p>
      {/* Shop details will be implemented in a future task */}
    </div>
  );
};

export default ShopDetailPage;