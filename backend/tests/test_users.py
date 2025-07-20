import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models import User
from app.services import auth_service
from app.schemas import UserCreate

def test_update_user_profile(client: TestClient, db_session: Session, test_user_token):
    """Test updating user profile information."""
    # Prepare update data
    update_data = {
        "email": "updated@example.com",
        "first_name": "Updated",
        "last_name": "User",
        "phone": "555-1234",
        "address": "123 Updated St"
    }
    
    # Send update request
    response = client.put(
        "/users/me",
        json=update_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == update_data["email"]
    assert data["first_name"] == update_data["first_name"]
    assert data["last_name"] == update_data["last_name"]
    
    # Verify database was updated
    user = db_session.query(User).filter(User.email == update_data["email"]).first()
    assert user is not None
    assert user.first_name == update_data["first_name"]
    assert user.last_name == update_data["last_name"]
    assert user.phone == update_data["phone"]
    assert user.address == update_data["address"]

def test_update_user_profile_email_exists(client: TestClient, db_session: Session, test_user_token):
    """Test updating user profile with an email that already exists."""
    # Create another user with a different email
    other_user = UserCreate(
        username="otheruser",
        email="other@example.com",
        password="password123",
        role="customer"
    )
    auth_service.create_user(db_session, other_user)
    
    # Try to update to the existing email
    update_data = {"email": "other@example.com"}
    
    response = client.put(
        "/users/me",
        json=update_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    # Should fail with 400 Bad Request
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_change_password(client: TestClient, db_session: Session, test_user, test_user_token):
    """Test changing user password."""
    password_data = {
        "current_password": "password123",  # This should match the test user's password
        "new_password": "newpassword123"
    }
    
    response = client.put(
        "/users/me/password",
        json=password_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    # Check response
    assert response.status_code == 200
    assert response.json()["message"] == "Password updated successfully"
    
    # Verify password was updated in database
    user = db_session.query(User).filter(User.id == test_user.id).first()
    assert auth_service.verify_password("newpassword123", user.password_hash)
    assert not auth_service.verify_password("password123", user.password_hash)

def test_change_password_incorrect_current(client: TestClient, test_user_token):
    """Test changing password with incorrect current password."""
    password_data = {
        "current_password": "wrongpassword",
        "new_password": "newpassword123"
    }
    
    response = client.put(
        "/users/me/password",
        json=password_data,
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    # Should fail with 400 Bad Request
    assert response.status_code == 400
    assert "Current password is incorrect" in response.json()["detail"]

def test_delete_account(client: TestClient, db_session: Session, test_user, test_user_token):
    """Test deleting user account."""
    response = client.delete(
        "/users/me",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    
    # Check response
    assert response.status_code == 200
    assert response.json()["message"] == "Account deleted successfully"
    
    # Verify user was deleted from database
    user = db_session.query(User).filter(User.id == test_user.id).first()
    assert user is None