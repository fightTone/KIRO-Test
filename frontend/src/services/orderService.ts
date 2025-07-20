import api from './api';
import { Order, OrderStatusUpdate, OrderFilters } from '../types';

export const orderService = {
  // Get all orders with optional filters
  getOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    
    if (filters?.shop_id) {
      params.append('shop_id', filters.shop_id.toString());
    }
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    
    return await api.get(`/orders/?${params.toString()}`);
  },
  
  // Get a specific order by ID
  getOrderById: async (orderId: number): Promise<Order> => {
    return await api.get(`/orders/${orderId}`);
  },
  
  // Update order status (shop owners only)
  updateOrderStatus: async (orderId: number, statusUpdate: OrderStatusUpdate): Promise<Order> => {
    return await api.put(`/orders/${orderId}`, statusUpdate);
  }
};

export default orderService;