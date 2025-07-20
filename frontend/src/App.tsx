import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, ThemeProvider, CartProvider, NotificationProvider } from './context/';
import { Layout, PrivateRoute, ErrorBoundary } from './components';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import './App.css';
import './styles/theme.css';
import './styles/shops.css';
import './styles/products.css';
import './styles/profile.css';

// Lazy load page components
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ShopsPage = lazy(() => import('./pages/Shops/ShopsPage'));
const ShopDetailPage = lazy(() => import('./pages/Shops/ShopDetailPage'));
const MyShopPage = lazy(() => import('./pages/Shops/MyShopPage'));
const ShopManagementPage = lazy(() => import('./pages/Shops/ShopManagementPage'));
const ProductsPage = lazy(() => import('./pages/Products/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/Products/ProductDetailPage'));
const ProductManagementPage = lazy(() => import('./pages/Products/ProductManagementPage'));
const CartPage = lazy(() => import('./pages/Cart/CartPage'));
const OrdersPage = lazy(() => import('./pages/Orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/Orders/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

function AppRoutes() {
  return (
    <Layout>
      <Suspense fallback={<div className="page-loading"><LoadingSpinner /></div>}>
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
          <Route path="/shop-management" element={
            <PrivateRoute requiredRole="shop_owner">
              <ShopManagementPage />
            </PrivateRoute>
          } />
          <Route path="/product-management" element={
            <PrivateRoute requiredRole="shop_owner">
              <ProductManagementPage />
            </PrivateRoute>
          } />
          <Route path="/product-management/:productId" element={
            <PrivateRoute requiredRole="shop_owner">
              <ProductManagementPage />
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
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <NotificationProvider>
                <AppRoutes />
              </NotificationProvider>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
