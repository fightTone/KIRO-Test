import api from './api';
import { User } from '../types';

export interface UserUpdateData {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

export interface PasswordUpdateData {
  current_password: string;
  new_password: string;
}

const userService = {
  /**
   * Update the current user's profile information
   */
  updateProfile: async (userData: UserUpdateData): Promise<User> => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  /**
   * Change the current user's password
   */
  changePassword: async (passwordData: PasswordUpdateData): Promise<{ message: string }> => {
    const response = await api.put('/users/me/password', passwordData);
    return response.data;
  },

  /**
   * Delete the current user's account
   */
  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete('/users/me');
    return response.data;
  },

  /**
   * Get shop owner statistics (orders and products)
   */
  getShopOwnerStats: async (): Promise<any> => {
    // This would need to be implemented in the backend
    // For now, we'll just return mock data
    const ordersResponse = await api.get('/orders?shop_owner=true');
    const productsResponse = await api.get('/products?owner=true');
    
    const pendingOrders = ordersResponse.data.filter(
      (order: any) => order.status === 'pending' || order.status === 'confirmed'
    ).length;
    
    return {
      totalOrders: ordersResponse.data.length,
      pendingOrders,
      totalProducts: productsResponse.data.length
    };
  }
};

export default userService;