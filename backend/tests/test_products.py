import pytest
from .test_fixtures import (
    test_user, shop_owner, test_categories, test_shop, 
    test_products, shop_owner_token, customer_token
)

def test_get_products(client, test_products):
    """Test getting all products"""
    response = client.get("/products/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Product 1"
    assert data[1]["name"] == "Product 2"

def test_get_products_with_filters(client, test_products, test_shop, test_categories):
    """Test getting products with filters"""
    # Filter by shop
    response = client.get(f"/products/?shop_id={test_shop.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # Filter by category
    response = client.get(f"/products/?category_id={test_categories[0].id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Product 1"
    
    # Filter by shop and category
    response = client.get(f"/products/?shop_id={test_shop.id}&category_id={test_categories[1].id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Product 2"
    
    # Filter with no results
    response = client.get("/products/?shop_id=999")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0

def test_get_product_by_id(client, test_products):
    """Test getting a product by ID"""
    # Get existing product
    response = client.get(f"/products/{test_products[0].id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Product 1"
    assert data["description"] == "Description for product 1"
    
    # Get non-existent product
    response = client.get("/products/999")
    assert response.status_code == 404
    assert "Product not found" in response.json()["detail"]

def test_create_product_as_shop_owner(client, shop_owner_token, test_shop, test_categories):
    """Test creating a product as a shop owner"""
    response = client.post(
        "/products/",
        headers={"Authorization": f"Bearer {shop_owner_token}"},
        json={
            "name": "New Product",
            "description": "A new product",
            "price": 39.99,
            "category_id": test_categories[2].id,
            "shop_id": test_shop.id,
            "stock_quantity": 15,
            "is_available": True
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Product"
    assert data["description"] == "A new product"
    assert float(data["price"]) == 39.99
    assert data["category_id"] == test_categories[2].id
    assert data["shop_id"] == test_shop.id

def test_create_product_for_other_shop(client, customer_token, test_shop, test_categories):
    """Test creating a product for a shop not owned by the user"""
    response = client.post(
        "/products/",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={
            "name": "New Product",
            "description": "A new product",
            "price": 39.99,
            "category_id": test_categories[2].id,
            "shop_id": test_shop.id,
            "stock_quantity": 15,
            "is_available": True
        }
    )
    assert response.status_code == 403
    assert "Not authorized. Shop owner role required" in response.json()["detail"]

def test_update_product(client, test_products, shop_owner_token):
    """Test updating a product"""
    response = client.put(
        f"/products/{test_products[0].id}",
        headers={"Authorization": f"Bearer {shop_owner_token}"},
        json={
            "name": "Updated Product",
            "description": "Updated description",
            "price": 49.99
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Product"
    assert data["description"] == "Updated description"
    assert float(data["price"]) == 49.99
    # Fields not included in the update should remain unchanged
    assert data["stock_quantity"] == 10

def test_update_product_not_owner(client, test_products, customer_token):
    """Test updating a product by a user who is not the shop owner"""
    response = client.put(
        f"/products/{test_products[0].id}",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={
            "name": "Updated Product",
            "description": "Updated description"
        }
    )
    assert response.status_code == 404
    assert "Product not found or you don't have permission to update it" in response.json()["detail"]

def test_delete_product(client, test_products, shop_owner_token):
    """Test deleting a product"""
    response = client.delete(
        f"/products/{test_products[0].id}",
        headers={"Authorization": f"Bearer {shop_owner_token}"}
    )
    assert response.status_code == 204
    
    # Verify product is deleted
    response = client.get(f"/products/{test_products[0].id}")
    assert response.status_code == 404

def test_delete_product_not_owner(client, test_products, customer_token):
    """Test deleting a product by a user who is not the shop owner"""
    response = client.delete(
        f"/products/{test_products[0].id}",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 404
    assert "Product not found or you don't have permission to delete it" in response.json()["detail"]