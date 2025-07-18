import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OrderNotification.css';

interface OrderNotificationProps {
  orderId: number;
  message: string;
  onClose: () => void;
}

const OrderNotification: React.FC<OrderNotificationProps> = ({ orderId, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide notification after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation before removing
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`order-notification ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="notification-content">
        <div className="notification-icon">🔔</div>
        <div className="notification-message">{message}</div>
      </div>
      <div className="notification-actions">
        <Link to={`/orders/${orderId}`} className="view-order-btn">View Order</Link>
        <button className="close-btn" onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default OrderNotification;