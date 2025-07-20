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
    return await api.put('/users/me', userData);
  },

  /**
   * Change the current user's password
   */
  changePassword: async (passwordData: PasswordUpdateData): Promise<{ message: string }> => {
    return await api.put('/users/me/password', passwordData);
  },

  /**
   * Delete the current user's account
   */
  deleteAccount: async (): Promise<{ message: string }> => {
    return await api.delete('/users/me');
  },

  /**
   * Get shop owner statistics (orders and products)
   */
  getShopOwnerStats: async (): Promise<any> => {
    // This would need to be implemented in the backend
    // For now, we'll just return mock data
    const orders = await api.get('/orders?shop_owner=true');
    const products = await api.get('/products?owner=true');
    
    const pendingOrders = orders.filter(
      (order: any) => order.status === 'pending' || order.status === 'confirmed'
    ).length;
    
    return {
      totalOrders: orders.length,
      pendingOrders,
      totalProducts: products.length
    };
  }
};

export default userService;