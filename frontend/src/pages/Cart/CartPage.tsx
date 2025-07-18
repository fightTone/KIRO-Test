import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context';
import './CartPage.css';

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const { cart, loading, error, updateItem, removeItem, clearAllItems } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Redirect if not a customer
  if (user && user.role !== 'customer') {
    return <Navigate to="/" />;
  }

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateItem(itemId, newQuantity);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem(itemId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearAllItems();
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    // This would be implemented in a future task
    alert('Checkout functionality will be implemented in a future task.');
    setCheckoutLoading(false);
  };

  const defaultImage = 'https://via.placeholder.com/100x100?text=No+Image';

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-spinner">Loading cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="error-message">{error}</div>
        <Link to="/products" className="continue-shopping">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        {cart && cart.total_items > 0 && (
          <span>{cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}</span>
        )}
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <Link to="/products" className="continue-shopping">Continue Shopping</Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <img 
                  src={defaultImage} 
                  alt={item.product_name} 
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <div>
                    <h3 className="cart-item-name">{item.product_name}</h3>
                    <div className="cart-item-price">${item.product_price.toFixed(2)}</div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button 
                        className="quantity-btn" 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input 
                        type="text" 
                        className="quantity-input" 
                        value={item.quantity} 
                        readOnly 
                      />
                      <button 
                        className="quantity-btn" 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="remove-btn" 
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="cart-item-total">
                  ${item.total_price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal ({cart.total_items} {cart.total_items === 1 ? 'item' : 'items'})</span>
              <span>${cart.total_amount.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>${cart.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="cart-actions">
            <button className="clear-cart-btn" onClick={handleClearCart}>
              Clear Cart
            </button>
            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>
            <button 
              className="checkout-btn" 
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;