import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import orderService from '../../services/orderService';
import { Order } from '../../types';
import './OrdersPage.css';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [shopFilter, setShopFilter] = useState<number | ''>('');
  const [shops, setShops] = useState<{ id: number; name: string }[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
  const [lastOrderIds, setLastOrderIds] = useState<Set<number>>(new Set());

  // Fetch orders on component mount and when filters change
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const filters: { status?: string; shop_id?: number } = {};
        
        if (statusFilter) {
          filters.status = statusFilter;
        }
        
        if (shopFilter && typeof shopFilter === 'number') {
          filters.shop_id = shopFilter;
        }
        
        const data = await orderService.getOrders(filters);
        
        // For shop owners, check for new orders and show notifications
        if (user?.role === 'shop_owner') {
          const pendingOrders = data.filter(order => order.status === 'pending');
          setNewOrdersCount(pendingOrders.length);
          
          // Check for new orders that weren't in the previous fetch
          const currentOrderIds = new Set(data.map(order => order.id));
          
          // If this isn't the first load (lastOrderIds is populated)
          if (lastOrderIds.size > 0) {
            // Find orders that are in currentOrderIds but not in lastOrderIds
            const newOrders = data.filter(order => !lastOrderIds.has(order.id));
            
            // Show notifications for new orders
            newOrders.forEach(order => {
              addNotification(
                order.id,
                `New order #${order.id} received for $${order.total_amount.toFixed(2)}`
              );
            });
          }
          
          // Update the set of known order IDs
          setLastOrderIds(currentOrderIds);
        }
        
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Set up polling for new orders if user is a shop owner
    let intervalId: NodeJS.Timeout;
    if (user?.role === 'shop_owner') {
      intervalId = setInterval(fetchOrders, 30000); // Check every 30 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [statusFilter, shopFilter, user?.role, addNotification]);

  // Fetch shops owned by the user if they are a shop owner
  useEffect(() => {
    const fetchShops = async () => {
      if (user?.role === 'shop_owner') {
        try {
          const response = await fetch('http://localhost:8000/shops/my-shops', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setShops(data);
          }
        } catch (err) {
          console.error('Error fetching shops:', err);
        }
      }
    };

    fetchShops();
  }, [user?.role]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get status class for styling
  const getStatusClass = (status: string) => {
    return `order-status status-${status.toLowerCase()}`;
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h1>{user?.role === 'shop_owner' ? 'Shop Orders' : 'My Orders'}</h1>
          <p>
            {user?.role === 'shop_owner' 
              ? `Manage orders for your shop${newOrdersCount > 0 ? ` (${newOrdersCount} new pending orders)` : ''}`
              : 'View your order history'}
          </p>
        </div>
      </div>

      <div className="orders-filters">
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {user?.role === 'shop_owner' && shops.length > 1 && (
          <select
            className="filter-select"
            value={shopFilter}
            onChange={(e) => setShopFilter(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">All Shops</option>
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner">Loading orders...</div>
      ) : error ? (
        <div className="notification error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <p>No orders found. {statusFilter && 'Try changing your filters.'}</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order #{order.id}</span>
                <span className="order-date">{formatDate(order.created_at)}</span>
              </div>
              
              <div className="order-details">
                <div>
                  {user?.role === 'shop_owner' && (
                    <div className="order-customer">
                      <strong>Customer:</strong> {order.customer_name || `Customer #${order.customer_id}`}
                    </div>
                  )}
                  <div>
                    <strong>Items:</strong> {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </div>
                </div>
                
                <div>
                  <div className="order-amount">
                    ${order.total_amount.toFixed(2)}
                  </div>
                  <div>
                    <span className={getStatusClass(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="order-actions">
                <Link to={`/orders/${order.id}`} className="view-button">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;