import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, ThemeProvider } from './context/';
import { PrivateRoute } from './components';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ShopsPage,
  ShopDetailPage,
  MyShopPage,
  ProductsPage,
  ProductDetailPage,
  CartPage,
  OrdersPage,
  OrderDetailPage,
  ProfilePage,
  NotFoundPage
} from './pages';
import './App.css';
import './styles/theme.css';

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/shops" element={<ShopsPage />} />
      <Route path="/shops/:shopId" element={<ShopDetailPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      
      {/* Protected routes - require authentication */}
      <Route path="/profile" element={
        <PrivateRoute>
          <ProfilePage />
        </PrivateRoute>
      } />
      
      {/* Customer-only routes */}
      <Route path="/cart" element={
        <PrivateRoute requiredRole="customer">
          <CartPage />
        </PrivateRoute>
      } />
      
      {/* Shop owner-only routes */}
      <Route path="/my-shop" element={
        <PrivateRoute requiredRole="shop_owner">
          <MyShopPage />
        </PrivateRoute>
      } />
      
      {/* Routes for both roles but with different views */}
      <Route path="/orders" element={
        <PrivateRoute>
          <OrdersPage />
        </PrivateRoute>
      } />
      <Route path="/orders/:orderId" element={
        <PrivateRoute>
          <OrderDetailPage />
        </PrivateRoute>
      } />
      
      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
