import pytest
from fastapi.testclient import TestClient
from app.models import Cart
from decimal import Decimal

def test_get_empty_cart(auth_client, test_user):
    """Test getting an empty cart"""
    response = auth_client.get("/cart/")
    
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total_items"] == 0
    assert data["total_amount"] == "0.00"

def test_add_to_cart(auth_client, test_products):
    """Test adding an item to the cart"""
    product = test_products[0]
    
    response = auth_client.post(
        "/cart/items",
        json={"product_id": product.id, "quantity": 2}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["product_id"] == product.id
    assert data["quantity"] == 2
    assert data["product_name"] == product.name
    assert data["product_price"] == str(product.price)
    assert data["total_price"] == str(product.price * 2)

def test_get_cart_with_items(auth_client, test_products, db_session, test_user):
    """Test getting a cart with items"""
    # Add items to cart directly in the database
    product1 = test_products[0]
    product2 = test_products[1]
    
    cart_items = [
        Cart(user_id=test_user.id, product_id=product1.id, quantity=2),
        Cart(user_id=test_user.id, product_id=product2.id, quantity=1)
    ]
    db_session.add_all(cart_items)
    db_session.commit()
    
    # Get cart
    response = auth_client.get("/cart/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["total_items"] == 2
    
    # Calculate expected total
    expected_total = product1.price * 2 + product2.price
    assert Decimal(data["total_amount"]) == expected_total

def test_update_cart_item(auth_client, test_products, db_session, test_user):
    """Test updating a cart item quantity"""
    # Add item to cart
    product = test_products[0]
    cart_item = Cart(user_id=test_user.id, product_id=product.id, quantity=1)
    db_session.add(cart_item)
    db_session.commit()
    
    # Update quantity
    response = auth_client.put(
        f"/cart/items/{cart_item.id}",
        json={"quantity": 3}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["quantity"] == 3
    assert data["total_price"] == str(product.price * 3)
    
    # Verify in database
    db_session.refresh(cart_item)
    assert cart_item.quantity == 3

def test_remove_from_cart(auth_client, test_products, db_session, test_user):
    """Test removing an item from the cart"""
    # Add item to cart
    product = test_products[0]
    cart_item = Cart(user_id=test_user.id, product_id=product.id, quantity=1)
    db_session.add(cart_item)
    db_session.commit()
    
    # Remove item
    response = auth_client.delete(f"/cart/items/{cart_item.id}")
    
    assert response.status_code == 204
    
    # Verify item is removed from database
    cart_items = db_session.query(Cart).filter(Cart.user_id == test_user.id).all()
    assert len(cart_items) == 0

def test_clear_cart(auth_client, test_products, db_session, test_user):
    """Test clearing the entire cart"""
    # Add multiple items to cart
    cart_items = [
        Cart(user_id=test_user.id, product_id=test_products[0].id, quantity=2),
        Cart(user_id=test_user.id, product_id=test_products[1].id, quantity=1)
    ]
    db_session.add_all(cart_items)
    db_session.commit()
    
    # Clear cart
    response = auth_client.delete("/cart/")
    
    assert response.status_code == 204
    
    # Verify all items are removed from database
    cart_items = db_session.query(Cart).filter(Cart.user_id == test_user.id).all()
    assert len(cart_items) == 0

def test_add_to_cart_product_not_found(auth_client):
    """Test adding a non-existent product to cart"""
    response = auth_client.post(
        "/cart/items",
        json={"product_id": 9999, "quantity": 1}
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

def test_add_to_cart_insufficient_stock(auth_client, test_products):
    """Test adding a product with insufficient stock"""
    product = test_products[0]
    
    response = auth_client.post(
        "/cart/items",
        json={"product_id": product.id, "quantity": product.stock_quantity + 1}
    )
    
    assert response.status_code == 400
    assert "Not enough stock" in response.json()["detail"]

def test_unauthorized_access(client):
    """Test accessing cart endpoints without authentication"""
    response = client.get("/cart/")
    assert response.status_code == 401
    
    response = client.post("/cart/items", json={"product_id": 1, "quantity": 1})
    assert response.status_code == 401