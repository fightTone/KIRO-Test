import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context';
import './CartIcon.css';

interface CartIconProps {
  onClick?: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({ onClick }) => {
  const { cart } = useCart();
  
  const itemCount = cart?.total_items || 0;
  
  return (
    <Link to="/cart" className="cart-icon-container" onClick={onClick}>
      <div className="cart-icon">
        🛒
        {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
      </div>
      <span className="cart-icon-text">Cart</span>
    </Link>
  );
};

export default CartIcon;