import api from './api';
import { Product } from '../types';

export interface ProductCreate {
  name: string;
  description?: string;
  price: number;
  category_id: number;
  image_url?: string;
  stock_quantity: number;
  is_available: boolean;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  category_id?: number;
  image_url?: string;
  stock_quantity?: number;
  is_available?: boolean;
}

// Get products for a specific shop
export const getShopProducts = async (shopId: number): Promise<Product[]> => {
  return await api.get(`/products`, {
    params: { shop_id: shopId }
  });
};

// Create a new product
export const createProduct = async (shopId: number, productData: ProductCreate): Promise<Product> => {
  const data = {
    ...productData,
    shop_id: shopId
  };
  return await api.post('/products', data);
};

// Update an existing product
export const updateProduct = async (productId: number, productData: ProductUpdate): Promise<Product> => {
  return await api.put(`/products/${productId}`, productData);
};

// Delete a product
export const deleteProduct = async (productId: number): Promise<void> => {
  await api.delete(`/products/${productId}`);
};

// Upload product image
export const uploadProductImage = async (productId: number, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/products/${productId}/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // For file uploads, we might still need to access the image_url property
  return response.image_url;
};