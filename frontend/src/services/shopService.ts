import api from './api';
import { Shop, Category } from '../types';

export const getShops = async (categoryId?: number): Promise<Shop[]> => {
  const params = categoryId ? { category_id: categoryId } : {};
  return await api.get('/shops', { params });
};

export const getShopById = async (shopId: number): Promise<Shop> => {
  return await api.get(`/shops/${shopId}`);
};

export const getCategories = async (): Promise<Category[]> => {
  return await api.get('/categories');
};

export const getFeaturedShops = async (limit: number = 4): Promise<Shop[]> => {
  return await api.get('/shops', { params: { limit } });
};