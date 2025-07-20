import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { CartSummary } from '../types';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../services/cartService';

interface CartContextType {
  cart: CartSummary | null;
  loading: boolean;
  error: string | null;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearAllItems: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'customer') {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cartData = await getCart();
      setCart(cartData);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user, fetchCart]);

  const addItem = async (productId: number, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      await addToCart(productId, quantity);
      await fetchCart(); // Refresh cart after adding item
    } catch (err: any) {
      console.error('Error adding item to cart:', err);
      setError(err.response?.data?.detail || 'Failed to add item to cart. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: number, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      await updateCartItem(itemId, quantity);
      await fetchCart(); // Refresh cart after updating item
    } catch (err: any) {
      console.error('Error updating cart item:', err);
      setError(err.response?.data?.detail || 'Failed to update cart item. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setLoading(true);
      setError(null);
      await removeCartItem(itemId);
      await fetchCart(); // Refresh cart after removing item
    } catch (err: any) {
      console.error('Error removing cart item:', err);
      setError(err.response?.data?.detail || 'Failed to remove cart item. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearAllItems = async () => {
    try {
      setLoading(true);
      setError(null);
      await clearCart();
      await fetchCart(); // Refresh cart after clearing
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.detail || 'Failed to clear cart. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  const value = {
    cart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearAllItems,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};