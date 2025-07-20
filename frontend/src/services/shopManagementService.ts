import api from './api';
import { Shop } from '../types';

export interface ShopCreate {
  name: string;
  description?: string;
  category_id: number;
  address: string;
  phone?: string;
  email?: string;
  image_url?: string;
}

export interface ShopUpdate {
  name?: string;
  description?: string;
  category_id?: number;
  address?: string;
  phone?: string;
  email?: string;
  image_url?: string;
  is_active?: boolean;
}

// Get shop owned by the current user
export const getMyShop = async (): Promise<Shop | null> => {
  try {
    const response = await api.get('/shops/my-shop');
    return response.data;
  } catch (error) {
    // If the user doesn't have a shop yet, return null
    if ((error as any).response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Create a new shop
export const createShop = async (shopData: ShopCreate): Promise<Shop> => {
  const response = await api.post('/shops', shopData);
  return response.data;
};

// Update an existing shop
export const updateShop = async (shopId: number, shopData: ShopUpdate): Promise<Shop> => {
  const response = await api.put(`/shops/${shopId}`, shopData);
  return response.data;
};

// Upload shop image
export const uploadShopImage = async (shopId: number, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/shops/${shopId}/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.image_url;
};