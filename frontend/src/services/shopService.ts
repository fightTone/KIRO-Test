import api from './api';
import { Shop, Category } from '../types';

export const getShops = async (categoryId?: number): Promise<Shop[]> => {
  const params = categoryId ? { category_id: categoryId } : {};
  const response = await api.get('/shops', { params });
  return response.data;
};

export const getShopById = async (shopId: number): Promise<Shop> => {
  const response = await api.get(`/shops/${shopId}`);
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
};

export const getFeaturedShops = async (limit: number = 4): Promise<Shop[]> => {
  const response = await api.get('/shops', { params: { limit } });
  return response.data;
};