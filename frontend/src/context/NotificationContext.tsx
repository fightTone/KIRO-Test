import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OrderNotification } from '../components/Notification';
import { useAuth } from './AuthContext';
import orderService from '../services/orderService';

interface Notification {
  id: number;
  orderId: number;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (orderId: number, message: string) => void;
  removeNotification: (id: number) => void;
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

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      
      {/* Render notifications */}
      {notifications.map(notification => (
        <OrderNotification
          key={notification.id}
          orderId={notification.orderId}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
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