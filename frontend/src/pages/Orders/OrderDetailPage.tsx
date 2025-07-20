import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import { Order, OrderStatusUpdate } from '../../types';
import './OrderDetailPage.css';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      setLoading(true);
      try {
        const data = await orderService.getOrderById(Number(orderId));
        setOrder(data);
        setNewStatus(data.status);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!order || !newStatus || newStatus === order.status) return;
    
    setUpdateLoading(true);
    setNotification(null);
    
    try {
      const statusUpdate: OrderStatusUpdate = { status: newStatus as any };
      const updatedOrder = await orderService.updateOrderStatus(order.id, statusUpdate);
      
      setOrder(updatedOrder);
      setNotification({
        type: 'success',
        message: `Order status updated to ${newStatus}`
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      setNotification({
        type: 'error',
        message: 'Failed to update order status. Please try again.'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Calculate order total
  const calculateTotal = () => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Get status class for styling
  const getStatusClass = (status: string) => {
    return `order-status status-${status.toLowerCase()}`;
  };

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <button className="back-button" onClick={() => navigate('/orders')}>
          ← Back to Orders
        </button>
        <h1>Order #{orderId}</h1>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading order details...</div>
      ) : error ? (
        <div className="notification error">{error}</div>
      ) : order ? (
        <>
          <div className="order-detail-card">
            <div className="order-meta">
              <div className="meta-item">
                <div className="meta-label">Order Date</div>
                <div className="meta-value">{formatDate(order.created_at)}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Last Updated</div>
                <div className="meta-value">{formatDate(order.updated_at)}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Status</div>
                <div className="meta-value">
                  <span className={getStatusClass(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Total Amount</div>
                <div className="meta-value">${order.total_amount.toFixed(2)}</div>
              </div>
            </div>

            {user && user.role.toLowerCase() === 'shop_owner' && (
              <div className="order-status-section">
                <h3>Update Order Status</h3>
                <div>
                  <select 
                    className="status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={updateLoading}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button 
                    className="update-status-button"
                    onClick={handleStatusUpdate}
                    disabled={updateLoading || newStatus === order.status}
                  >
                    {updateLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            )}

            {user && user.role.toLowerCase() === 'shop_owner' && (
              <div className="customer-info-section">
                <h3>Customer Information</h3>
                <div className="order-meta">
                  <div className="meta-item">
                    <div className="meta-label">Customer ID</div>
                    <div className="meta-value">{order.customer_id}</div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-label">Delivery Address</div>
                    <div className="meta-value">{order.delivery_address}</div>
                  </div>
                  {order.notes && (
                    <div className="meta-item">
                      <div className="meta-label">Notes</div>
                      <div className="meta-value">{order.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="order-items-section">
            <h2>Order Items</h2>
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="order-total">
              Total: ${calculateTotal().toFixed(2)}
            </div>
          </div>
        </>
      ) : (
        <div className="notification error">Order not found</div>
      )}
    </div>
  );
};

export default OrderDetailPage;