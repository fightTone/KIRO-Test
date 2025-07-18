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
    
    const response = await api.get(`/orders/?${params.toString()}`);
    return response.data;
  },
  
  // Get a specific order by ID
  getOrderById: async (orderId: number): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  
  // Update order status (shop owners only)
  updateOrderStatus: async (orderId: number, statusUpdate: OrderStatusUpdate): Promise<Order> => {
    const response = await api.put(`/orders/${orderId}`, statusUpdate);
    return response.data;
  }
};

export default orderService;