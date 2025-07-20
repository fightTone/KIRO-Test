import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models import Order, OrderItem, Cart, Product
from decimal import Decimal
import json
from datetime import datetime, timedelta

@pytest.fixture
def multiple_orders(db_session, test_user, test_shop, test_products):
    """Fixture to create multiple orders with different statuses"""
    orders = []
    
    # Create orders with different statuses
    statuses = ["pending", "confirmed", "preparing", "ready", "delivered"]
    
    for i, status in enumerate(statuses):
        # Create order with different creation dates
        order = Order(
            customer_id=test_user.id,
            shop_id=test_shop.id,
            total_amount=Decimal(f"{50 + i}.99"),
            status=status,
            delivery_address="123 Test St, Test City",
            notes=f"Test order {i+1}",
            created_at=datetime.now() - timedelta(days=i)
        )
        db_session.add(order)
        db_session.flush()
        
        # Create order items
        order_item = OrderItem(
            order_id=order.id,
            product_id=test_products[0].id,
            quantity=i+1,
            price=test_products[0].price
        )
        db_session.add(order_item)
        orders.append(order)
    
    db_session.commit()
    return orders

def test_get_orders_with_pagination(auth_client, multiple_orders):
    """Test getting orders with pagination"""
    # Get first page (2 items)
    response = auth_client.get("/orders/?limit=2&offset=0")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # Get second page (2 items)
    response = auth_client.get("/orders/?limit=2&offset=2")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # Get third page (1 item)
    response = auth_client.get("/orders/?limit=2&offset=4")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

def test_get_orders_with_date_filter(auth_client, multiple_orders):
    """Test getting orders with date filter"""
    # Get orders from the last 2 days
    today = datetime.now().date()
    two_days_ago = (today - timedelta(days=2)).isoformat()
    
    response = auth_client.get(f"/orders/?created_after={two_days_ago}")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3  # Should return the 3 most recent orders

def test_get_orders_with_multiple_filters(auth_client, multiple_orders):
    """Test getting orders with multiple filters"""
    # Get pending or confirmed orders
    response = auth_client.get("/orders/?status=pending,confirmed")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["status"] in ["pending", "confirmed"]
    assert data[1]["status"] in ["pending", "confirmed"]

def test_order_creation_reduces_stock(auth_client, test_shop, db_session, test_user, test_products):
    """Test that creating an order reduces product stock"""
    # Get initial stock
    product = test_products[0]
    initial_stock = product.stock_quantity
    
    # Add item to cart
    cart_item = Cart(user_id=test_user.id, product_id=product.id, quantity=3)
    db_session.add(cart_item)
    db_session.commit()
    
    # Create order
    response = auth_client.post(
        "/orders/",
        json={
            "shop_id": test_shop.id,
            "delivery_address": "123 Test St, Test City",
            "notes": "Test order notes"
        }
    )
    
    assert response.status_code == 201
    
    # Check that stock was reduced
    db_session.refresh(product)
    assert product.stock_quantity == initial_stock - 3

def test_order_creation_clears_cart(auth_client, test_shop, db_session, test_user, test_products):
    """Test that creating an order clears the cart"""
    # Add item to cart
    cart_item = Cart(user_id=test_user.id, product_id=test_products[0].id, quantity=2)
    db_session.add(cart_item)
    db_session.commit()
    
    # Create order
    response = auth_client.post(
        "/orders/",
        json={
            "shop_id": test_shop.id,
            "delivery_address": "123 Test St, Test City",
            "notes": "Test order notes"
        }
    )
    
    assert response.status_code == 201
    
    # Check that cart is empty
    cart_items = db_session.query(Cart).filter(Cart.user_id == test_user.id).all()
    assert len(cart_items) == 0

def test_order_with_invalid_status_update(shop_owner_client, test_order):
    """Test updating an order with an invalid status"""
    response = shop_owner_client.put(
        f"/orders/{test_order.id}",
        json={"status": "invalid_status"}
    )
    
    assert response.status_code == 422  # Validation error

def test_order_status_transition_validation(shop_owner_client, test_order):
    """Test order status transition validation"""
    # Try to update from pending to delivered (skipping steps)
    response = shop_owner_client.put(
        f"/orders/{test_order.id}",
        json={"status": "delivered"}
    )
    
    # This should still work as we're not enforcing strict transitions
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "delivered"

def test_get_order_not_found(auth_client):
    """Test getting a non-existent order"""
    response = auth_client.get("/orders/9999")
    
    assert response.status_code == 404
    assert "Order not found" in response.json()["detail"]

def test_update_order_not_found(shop_owner_client):
    """Test updating a non-existent order"""
    response = shop_owner_client.put(
        "/orders/9999",
        json={"status": "confirmed"}
    )
    
    assert response.status_code == 404
    assert "Order not found" in response.json()["detail"]

def test_order_creation_with_out_of_stock_product(auth_client, test_shop, db_session, test_user, test_products):
    """Test order creation with out of stock product"""
    product = test_products[0]
    
    # Set product stock to 0
    product.stock_quantity = 0
    db_session.commit()
    
    # Add item to cart
    cart_item = Cart(user_id=test_user.id, product_id=product.id, quantity=1)
    db_session.add(cart_item)
    db_session.commit()
    
    # Try to create order
    response = auth_client.post(
        "/orders/",
        json={
            "shop_id": test_shop.id,
            "delivery_address": "123 Test St, Test City",
            "notes": "Test order notes"
        }
    )
    
    assert response.status_code == 400
    assert "Not enough stock" in response.json()["detail"]