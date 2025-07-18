import api from './api';
import { Product, Category } from '../types';

export const getProducts = async (shopId?: number, categoryId?: number) => {
  let url = '/products';
  const params = new URLSearchParams();
  
  if (shopId) params.append('shop_id', shopId.toString());
  if (categoryId) params.append('category_id', categoryId.toString());
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await api.get(url);
  return response.data;
};

export const getProduct = async (productId: number): Promise<Product> => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
};