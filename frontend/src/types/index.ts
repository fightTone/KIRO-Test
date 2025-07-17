// User types
export interface User {
  id: number;
  email: string;
  username: string;
  role: 'customer' | 'shop_owner';
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserRegistration {
  email: string;
  username: string;
  password: string;
  role: 'customer' | 'shop_owner';
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

// Shop types
export interface Shop {
  id: number;
  owner_id: number;
  name: string;
  description?: string;
  category_id: number;
  address: string;
  phone?: string;
  email?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

// Product types
export interface Product {
  id: number;
  shop_id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  image_url?: string;
  stock_quantity: number;
  is_available: boolean;
  created_at: string;
}

// Cart types
export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
}

export interface CartSummary {
  items: CartItem[];
  total_items: number;
  total_amount: number;
}

// Order types
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customer_id: number;
  shop_id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  delivery_address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}