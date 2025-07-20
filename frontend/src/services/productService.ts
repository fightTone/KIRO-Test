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
  
  return await api.get(url);
};

export const getProduct = async (productId: number): Promise<Product> => {
  return await api.get(`/products/${productId}`);
};

export const getCategories = async (): Promise<Category[]> => {
  return await api.get('/categories');
};