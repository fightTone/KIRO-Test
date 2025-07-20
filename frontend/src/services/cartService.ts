import api from './api';
import { CartSummary, CartItem, CartItemCreate, CartItemUpdate } from '../types';

export const getCart = async (): Promise<CartSummary> => {
  return await api.get('/cart');
};

export const addToCart = async (productId: number, quantity: number): Promise<CartItem> => {
  const cartItem: CartItemCreate = {
    product_id: productId,
    quantity: quantity
  };
  return await api.post('/cart/items', cartItem);
};

export const updateCartItem = async (itemId: number, quantity: number): Promise<CartItem> => {
  const cartItem: CartItemUpdate = {
    quantity: quantity
  };
  return await api.put(`/cart/items/${itemId}`, cartItem);
};

export const removeCartItem = async (itemId: number): Promise<void> => {
  await api.delete(`/cart/items/${itemId}`);
};

export const clearCart = async (): Promise<void> => {
  await api.delete('/cart');
};