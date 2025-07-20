import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import OrderNotification from '../components/Notification/OrderNotification';
import NotificationComponent from '../components/Notification/Notification';
import { useAuth } from './AuthContext';
import orderService from '../services/orderService';
import { extractApiError } from '../services/api';

interface Notification {
  id: number;
  orderId?: number;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (orderId: number, message: string) => void;
  removeNotification: (id: number) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  showApiError: (error: any, defaultMessage?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());
  const { user, isAuthenticated } = useAuth();

  // Check for new orders periodically for shop owners
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'shop_owner') return;

    const checkForNewOrders = async () => {
      try {
        const orders = await orderService.getOrders({ status: 'pending' });
        
        // Filter orders created after last check time
        const newOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate > lastCheckedTime;
        });
        
        // Create notifications for new orders
        if (newOrders.length > 0) {
          newOrders.forEach(order => {
            addNotification(
              order.id,
              `New order #${order.id} received for $${order.total_amount.toFixed(2)}`
            );
          });
        }
        
        // Update last checked time
        setLastCheckedTime(new Date());
      } catch (error) {
        console.error('Error checking for new orders:', error);
      }
    };

    // Check immediately on mount
    checkForNewOrders();
    
    // Then check every 30 seconds
    const interval = setInterval(checkForNewOrders, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.role, lastCheckedTime]);

  const addNotification = (orderId: number, message: string) => {
    const newNotification = {
      id: Date.now(),
      orderId,
      message
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const showApiError = (error: any, defaultMessage: string = 'An error occurred') => {
    const apiError = extractApiError(error);
    showNotification(apiError.message || defaultMessage, 'error');
    
    // Log the full error to console for debugging
    console.error('API Error:', error);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, showNotification, showApiError }}>
      {children}
      
      {/* Render notifications */}
      {notifications.map(notification => (
        notification.orderId ? (
          <OrderNotification
            key={notification.id}
            orderId={notification.orderId}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ) : (
          <NotificationComponent
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        )
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};