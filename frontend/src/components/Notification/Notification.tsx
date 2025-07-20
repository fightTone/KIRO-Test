import React, { useState, useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation before removing
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`notification ${type} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="notification-content">
        <div className="notification-icon">{getIcon()}</div>
        <div className="notification-message">{message}</div>
      </div>
      <button className="close-btn" onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }}>
        ✕
      </button>
    </div>
  );
};

export default Notification;