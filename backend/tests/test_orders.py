import pytest
from fastapi.testclient import TestClient
from app.models import Order, OrderItem, Cart
from decimal import Decimal

@pytest.fixture
def cart_with_items(db_session, test_user, test_products):
    """Fixture to create cart items for testing order creation"""
    cart_items = [
        Cart(user_id=test_user.id, product_id=test_products[0].id, quantity=2),
        Cart(user_id=test_user.id, product_id=test_products[1].id, quantity=1)
    ]
    db_session.add_all(cart_items)
    db_session.commit()
    return cart_items

@pytest.fixture
def test_order(db_session, test_user, test_shop, test_products):
    """Fixture to create a test order"""
    # Create order
    order = Order(
        customer_id=test_user.id,
        shop_id=test_shop.id,
        total_amount=Decimal("69.97"),  # 19.99*2 + 29.99
        status="pending",
        delivery_address="123 Test St, Test City",
        notes="Test order notes"
    )
    db_session.add(order)
    db_session.flush()
    
    # Create order items
    order_items = [
        OrderItem(
            order_id=order.id,
            product_id=test_products[0].id,
            quantity=2,
            price=test_products[0].price
        ),
        OrderItem(
            order_id=order.id,
            product_id=test_products[1].id,
            quantity=1,
            price=test_products[1].price
        )
    ]
    db_session.add_all(order_items)
    db_session.commit()
    
    return order

def test_create_order(auth_client, test_shop, cart_with_items):
    """Test creating an order from cart items"""
    response = auth_client.post(
        "/orders/",
        json={
            "shop_id": test_shop.id,
            "delivery_address": "123 Test St, Test City",
            "notes": "Test order notes"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["shop_id"] == test_shop.id
    assert data["status"] == "pending"
    assert data["delivery_address"] == "123 Test St, Test City"
    assert data["notes"] == "Test order notes"
    assert len(data["items"]) == 2
    assert Decimal(data["total_amount"]) == Decimal("69.97")  # 19.99*2 + 29.99

def test_get_orders_customer(auth_client, test_order):
    """Test getting orders as a customer"""
    response = auth_client.get("/orders/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == test_order.id
    assert data[0]["status"] == "pending"
    assert len(data[0]["items"]) == 2

def test_get_orders_shop_owner(shop_owner_client, test_order):
    """Test getting orders as a shop owner"""
    response = shop_owner_client.get("/orders/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == test_order.id

def test_get_orders_with_filters(auth_client, test_order, test_shop):
    """Test getting orders with filters"""
    # Filter by shop
    response = auth_client.get(f"/orders/?shop_id={test_shop.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    
    # Filter by status
    response = auth_client.get("/orders/?status=pending")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    
    # Filter by non-matching status
    response = auth_client.get("/orders/?status=delivered")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0

def test_get_specific_order(auth_client, test_order):
    """Test getting a specific order"""
    response = auth_client.get(f"/orders/{test_order.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_order.id
    assert data["status"] == "pending"
    assert len(data["items"]) == 2

def test_update_order_status(shop_owner_client, test_order):
    """Test updating an order status as shop owner"""
    response = shop_owner_client.put(
        f"/orders/{test_order.id}",
        json={"status": "confirmed"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "confirmed"

def test_customer_cannot_update_order(auth_client, test_order):
    """Test that customers cannot update order status"""
    response = auth_client.put(
        f"/orders/{test_order.id}",
        json={"status": "confirmed"}
    )
    
    assert response.status_code == 403

def test_create_order_empty_cart(auth_client, test_shop, db_session):
    """Test creating an order with an empty cart"""
    response = auth_client.post(
        "/orders/",
        json={
            "shop_id": test_shop.id,
            "delivery_address": "123 Test St, Test City",
            "notes": "Test order notes"
        }
    )
    
    assert response.status_code == 400
    assert "No items in cart" in response.json()["detail"]

def test_create_order_invalid_shop(auth_client, cart_with_items):
    """Test creating an order with an invalid shop ID"""
    response = auth_client.post(
        "/orders/",
        json={
            "shop_id": 9999,
            "delivery_address": "123 Test St, Test City",
            "notes": "Test order notes"
        }
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

def test_unauthorized_access(client):
    """Test accessing order endpoints without authentication"""
    response = client.get("/orders/")
    assert response.status_code == 401
    
    response = client.post(
        "/orders/",
        json={
            "shop_id": 1,
            "delivery_address": "123 Test St",
            "notes": "Test"
        }
    )
    assert response.status_code == 401