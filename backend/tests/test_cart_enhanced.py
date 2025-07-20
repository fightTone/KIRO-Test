import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models import Cart, Product
from decimal import Decimal

def test_add_duplicate_product_to_cart(auth_client, test_products):
    """Test adding the same product to cart twice should update quantity"""
    product = test_products[0]
    
    # Add product first time
    response1 = auth_client.post(
        "/cart/items",
        json={"product_id": product.id, "quantity": 2}
    )
    assert response1.status_code == 201
    
    # Add same product second time
    response2 = auth_client.post(
        "/cart/items",
        json={"product_id": product.id, "quantity": 3}
    )
    
    # Should return 200 OK instead of 201 Created
    assert response2.status_code == 200
    data = response2.json()
    
    # Quantity should be updated to the sum
    assert data["quantity"] == 5
    assert data["total_price"] == str(product.price * 5)

def test_update_cart_item_zero_quantity(auth_client, test_products, db_session, test_user):
    """Test updating a cart item to zero quantity should remove it"""
    # Add item to cart
    product = test_products[0]
    cart_item = Cart(user_id=test_user.id, product_id=product.id, quantity=2)
    db_session.add(cart_item)
    db_session.commit()
    
    # Update quantity to zero
    response = auth_client.put(
        f"/cart/items/{cart_item.id}",
        json={"quantity": 0}
    )
    
    # Should return 204 No Content
    assert response.status_code == 204
    
    # Verify item is removed from database
    cart_items = db_session.query(Cart).filter(Cart.id == cart_item.id).all()
    assert len(cart_items) == 0

def test_update_cart_item_negative_quantity(auth_client, test_products, db_session, test_user):
    """Test updating a cart item with negative quantity should return error"""
    # Add item to cart
    product = test_products[0]
    cart_item = Cart(user_id=test_user.id, product_id=product.id, quantity=2)
    db_session.add(cart_item)
    db_session.commit()
    
    # Update with negative quantity
    response = auth_client.put(
        f"/cart/items/{cart_item.id}",
        json={"quantity": -1}
    )
    
    # Should return 400 Bad Request
    assert response.status_code == 400
    assert "Quantity must be positive" in response.json()["detail"]

def test_update_cart_item_not_found(auth_client):
    """Test updating a non-existent cart item"""
    response = auth_client.put(
        "/cart/items/9999",
        json={"quantity": 5}
    )
    
    assert response.status_code == 404
    assert "Cart item not found" in response.json()["detail"]

def test_update_cart_item_insufficient_stock(auth_client, test_products, db_session, test_user):
    """Test updating cart item quantity beyond available stock"""
    # Add item to cart
    product = test_products[0]
    cart_item = Cart(user_id=test_user.id, product_id=product.id, quantity=1)
    db_session.add(cart_item)
    db_session.commit()
    
    # Update quantity beyond stock
    response = auth_client.put(
        f"/cart/items/{cart_item.id}",
        json={"quantity": product.stock_quantity + 1}
    )
    
    assert response.status_code == 400
    assert "Not enough stock" in response.json()["detail"]

def test_remove_cart_item_not_found(auth_client):
    """Test removing a non-existent cart item"""
    response = auth_client.delete("/cart/items/9999")
    
    assert response.status_code == 404
    assert "Cart item not found" in response.json()["detail"]

def test_cart_with_unavailable_product(auth_client, test_products, db_session, test_user):
    """Test cart behavior when a product becomes unavailable"""
    # Add item to cart
    product = test_products[0]
    cart_item = Cart(user_id=test_user.id, product_id=product.id, quantity=1)
    db_session.add(cart_item)
    db_session.commit()
    
    # Make product unavailable
    product.is_available = False
    db_session.commit()
    
    # Get cart
    response = auth_client.get("/cart/")
    
    assert response.status_code == 200
    data = response.json()
    
    # Cart should still contain the item but mark it as unavailable
    assert len(data["items"]) == 1
    assert data["items"][0]["product_id"] == product.id
    assert data["items"][0]["is_available"] == False

def test_cart_with_stock_changes(auth_client, test_products, db_session, test_user):
    """Test cart behavior when product stock changes"""
    # Add item to cart with quantity 5
    product = test_products[0]
    original_stock = product.stock_quantity
    cart_item = Cart(user_id=test_user.id, product_id=product.id, quantity=5)
    db_session.add(cart_item)
    db_session.commit()
    
    # Reduce product stock to 3
    product.stock_quantity = 3
    db_session.commit()
    
    # Get cart
    response = auth_client.get("/cart/")
    
    assert response.status_code == 200
    data = response.json()
    
    # Cart should show the item with a warning about stock
    assert len(data["items"]) == 1
    assert data["items"][0]["product_id"] == product.id
    assert data["items"][0]["quantity"] == 5
    assert data["items"][0]["available_stock"] == 3
    assert data["items"][0]["stock_warning"] == True
    
    # Restore original stock
    product.stock_quantity = original_stock
    db_session.commit()

def test_cart_performance_with_many_items(auth_client, db_session, test_user):
    """Test cart performance with a large number of items"""
    # Create 20 test products
    products = []
    for i in range(20):
        product = Product(
            shop_id=1,  # Assuming shop with ID 1 exists
            name=f"Test Product {i}",
            description=f"Description for product {i}",
            price=Decimal(f"{10 + i}.99"),
            category_id=1,  # Assuming category with ID 1 exists
            stock_quantity=100,
            is_available=True
        )
        db_session.add(product)
        db_session.flush()  # To get the product ID
        products.append(product)
    
    # Add all products to cart
    cart_items = []
    for product in products:
        cart_item = Cart(user_id=test_user.id, product_id=product.id, quantity=1)
        cart_items.append(cart_item)
    
    db_session.add_all(cart_items)
    db_session.commit()
    
    # Get cart
    response = auth_client.get("/cart/")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify all items are in the cart
    assert len(data["items"]) == 20
    assert data["total_items"] == 20
    
    # Calculate expected total
    expected_total = sum(product.price for product in products)
    assert Decimal(data["total_amount"]) == expected_total