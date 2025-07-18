import api from './api';
import { CartSummary, CartItem, CartItemCreate, CartItemUpdate } from '../types';

export const getCart = async (): Promise<CartSummary> => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId: number, quantity: number): Promise<CartItem> => {
  const cartItem: CartItemCreate = {
    product_id: productId,
    quantity: quantity
  };
  const response = await api.post('/cart/items', cartItem);
  return response.data;
};

export const updateCartItem = async (itemId: number, quantity: number): Promise<CartItem> => {
  const cartItem: CartItemUpdate = {
    quantity: quantity
  };
  const response = await api.put(`/cart/items/${itemId}`, cartItem);
  return response.data;
};

export const removeCartItem = async (itemId: number): Promise<void> => {
  await api.delete(`/cart/items/${itemId}`);
};

export const clearCart = async (): Promise<void> => {
  await api.delete('/cart');
};