import pytest
from .test_fixtures import test_user, shop_owner, test_categories, shop_owner_token, customer_token

def test_get_categories(client, test_categories):
    """Test getting all categories"""
    response = client.get("/categories/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["name"] == "Clothing"
    assert data[1]["name"] == "Food"
    assert data[2]["name"] == "Electronics"

def test_get_category_by_id(client, test_categories):
    """Test getting a category by ID"""
    # Get existing category
    response = client.get(f"/categories/{test_categories[0].id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Clothing"
    assert data["description"] == "Clothing items"
    
    # Get non-existent category
    response = client.get("/categories/999")
    assert response.status_code == 404
    assert "Category not found" in response.json()["detail"]

def test_create_category(client, shop_owner_token):
    """Test creating a category"""
    response = client.post(
        "/categories/",
        headers={"Authorization": f"Bearer {shop_owner_token}"},
        json={
            "name": "Furniture",
            "description": "Home furniture items"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Furniture"
    assert data["description"] == "Home furniture items"

def test_create_duplicate_category(client, test_categories, shop_owner_token):
    """Test creating a category with a duplicate name"""
    response = client.post(
        "/categories/",
        headers={"Authorization": f"Bearer {shop_owner_token}"},
        json={
            "name": "Clothing",  # Already exists
            "description": "Duplicate category"
        }
    )
    assert response.status_code == 400
    assert "Category with name 'Clothing' already exists" in response.json()["detail"]

def test_update_category(client, test_categories, shop_owner_token):
    """Test updating a category"""
    response = client.put(
        f"/categories/{test_categories[0].id}",
        headers={"Authorization": f"Bearer {shop_owner_token}"},
        json={
            "name": "Apparel",
            "description": "Updated description for clothing"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Apparel"
    assert data["description"] == "Updated description for clothing"

def test_update_category_duplicate_name(client, test_categories, shop_owner_token):
    """Test updating a category with a duplicate name"""
    response = client.put(
        f"/categories/{test_categories[0].id}",
        headers={"Authorization": f"Bearer {shop_owner_token}"},
        json={
            "name": "Food",  # Already exists
            "description": "Updated description"
        }
    )
    assert response.status_code == 400
    assert "Category name already exists" in response.json()["detail"]

def test_delete_category(client, test_categories, shop_owner_token):
    """Test deleting a category"""
    response = client.delete(
        f"/categories/{test_categories[2].id}",
        headers={"Authorization": f"Bearer {shop_owner_token}"}
    )
    assert response.status_code == 204
    
    # Verify category is deleted
    response = client.get(f"/categories/{test_categories[2].id}")
    assert response.status_code == 404

def test_delete_nonexistent_category(client, shop_owner_token):
    """Test deleting a non-existent category"""
    response = client.delete(
        "/categories/999",
        headers={"Authorization": f"Bearer {shop_owner_token}"}
    )
    assert response.status_code == 404
    assert "Category not found" in response.json()["detail"]