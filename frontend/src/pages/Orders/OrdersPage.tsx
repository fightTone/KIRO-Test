import React from 'react';
import { useAuth } from '../../context/AuthContext';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>{user?.role === 'shop_owner' ? 'Shop Orders' : 'My Orders'}</h1>
      <p>{user?.role === 'shop_owner' ? 'Manage orders for your shop' : 'View your order history'}</p>
      {/* Orders management will be implemented in a future task */}
    </div>
  );
};

export default OrdersPage;