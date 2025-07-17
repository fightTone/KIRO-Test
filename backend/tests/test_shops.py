import pytest
from .test_fixtures import test_user, shop_owner, test_categories, test_shop, shop_owner_token, customer_token

def test_get_shops(client, test_shop):
    """Test getting all shops"""
    response = client.get("/shops/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Shop"

def test_get_shops_with_category_filter(client, test_shop, test_categories):
    """Test getting shops with category filter"""
    # Get shops with valid category
    response = client.get(f"/shops/?category_id={test_categories[0].id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Shop"
    
    # Get shops with invalid category
    response = client.get("/shops/?category_id=999")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0

def test_get_shop_by_id(client, test_shop):
    """Test getting a shop by ID"""
    # Get existing shop
    response = client.get(f"/shops/{test_shop.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Shop"
    assert data["description"] == "A test shop"
    
    # Get non-existent shop
    response = client.get("/shops/999")
    assert response.status_code == 404
    assert "Shop not found" in response.json()["detail"]

def test_create_shop_as_shop_owner(client, shop_owner_token, test_categories):
    """Test creating a shop as a shop owner"""
    response = client.post(
        "/shops/",
        headers={"Authorization": f"Bearer {shop_owner_token}"},
        json={
            "name": "New Shop",
            "description": "A new shop",
            "category_id": test_categories[1].id,
            "address": "456 New St",
            "phone": "987-654-3210",
            "email": "newshop@example.com"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Shop"
    assert data["description"] == "A new shop"
    assert data["category_id"] == test_categories[1].id

def test_create_shop_as_customer(client, customer_token, test_categories):
    """Test creating a shop as a customer (should fail)"""
    response = client.post(
        "/shops/",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={
            "name": "New Shop",
            "description": "A new shop",
            "category_id": test_categories[1].id,
            "address": "456 New St",
            "phone": "987-654-3210",
            "email": "newshop@example.com"
        }
    )
    assert response.status_code == 403
    assert "Not authorized. Shop owner role required" in response.json()["detail"]

def test_update_shop(client, test_shop, shop_owner_token):
    """Test updating a shop"""
    response = client.put(
        f"/shops/{test_shop.id}",
        headers={"Authorization": f"Bearer {shop_owner_token}"},
        json={
            "name": "Updated Shop",
            "description": "Updated description"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Shop"
    assert data["description"] == "Updated description"
    # Fields not included in the update should remain unchanged
    assert data["address"] == "123 Test St"

def test_update_shop_not_owner(client, test_shop, customer_token):
    """Test updating a shop by a user who is not the owner"""
    response = client.put(
        f"/shops/{test_shop.id}",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={
            "name": "Updated Shop",
            "description": "Updated description"
        }
    )
    assert response.status_code == 404
    assert "Shop not found or you don't have permission to update it" in response.json()["detail"]

def test_delete_shop(client, test_shop, shop_owner_token):
    """Test deleting a shop"""
    response = client.delete(
        f"/shops/{test_shop.id}",
        headers={"Authorization": f"Bearer {shop_owner_token}"}
    )
    assert response.status_code == 204
    
    # Verify shop is deleted
    response = client.get(f"/shops/{test_shop.id}")
    assert response.status_code == 404

def test_delete_shop_not_owner(client, test_shop, customer_token):
    """Test deleting a shop by a user who is not the owner"""
    response = client.delete(
        f"/shops/{test_shop.id}",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert response.status_code == 404
    assert "Shop not found or you don't have permission to delete it" in response.json()["detail"]