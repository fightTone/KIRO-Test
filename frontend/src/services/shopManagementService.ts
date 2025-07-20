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
    return await api.get('/shops/my-shop');
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
  return await api.post('/shops', shopData);
};

// Update an existing shop
export const updateShop = async (shopId: number, shopData: ShopUpdate): Promise<Shop> => {
  return await api.put(`/shops/${shopId}`, shopData);
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
  
  // For file uploads, we might still need to access the image_url property
  return response.image_url;
};