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
}export 
interface UserRegistration {
  email: string;
  username: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
}