export interface User {
  id: number;
  email: string;
  username: string;
  role: 'customer' | 'shop_owner';
  first_name?: string;
  last_name?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

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

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  product_price: number;
  total_price: number;
}

export interface CartSummary {
  items: CartItem[];
  total_items: number;
  total_amount: number;
}

export interface CartItemCreate {
  product_id: number;
  quantity: number;
}

export interface CartItemUpdate {
  quantity: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
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
  customer_name?: string; // Added for display purposes
}

export interface OrderStatusUpdate {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

export interface OrderFilters {
  shop_id?: number;
  status?: string;
}

export interface UserRegistration {
  email: string;
  username: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
}