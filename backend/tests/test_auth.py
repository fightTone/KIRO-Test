import pytest
from app.services import auth_service
from app.models import User

@pytest.fixture(scope="function")
def test_user(db_session):
    # Create a test user
    test_user = User(
        email="test@example.com",
        username="testuser",
        password_hash=auth_service.get_password_hash("password123"),
        role="customer",
        first_name="Test",
        last_name="User"
    )
    db_session.add(test_user)
    db_session.commit()
    
    return test_user

def test_create_user(client, db_session):
    """Test user creation"""
    response = client.post(
        "/auth/signup",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "password123",
            "role": "customer",
            "first_name": "New",
            "last_name": "User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert data["role"] == "customer"
    assert "password" not in data

def test_create_user_duplicate_email(client, test_user):
    """Test user creation with duplicate email"""
    response = client.post(
        "/auth/signup",
        json={
            "email": "test@example.com",  # Already exists
            "username": "uniqueuser",
            "password": "password123",
            "role": "customer",
            "first_name": "Unique",
            "last_name": "User"
        }
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_create_user_duplicate_username(client, test_user):
    """Test user creation with duplicate username"""
    response = client.post(
        "/auth/signup",
        json={
            "email": "unique@example.com",
            "username": "testuser",  # Already exists
            "password": "password123",
            "role": "customer",
            "first_name": "Unique",
            "last_name": "User"
        }
    )
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]

def test_login_success(client, test_user):
    """Test successful login"""
    response = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client, test_user):
    """Test login with invalid credentials"""
    response = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

def test_get_current_user(client, test_user):
    """Test getting current user information"""
    # First login to get token
    login_response = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Use token to get current user
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert data["role"] == "customer"

def test_get_current_user_invalid_token(client):
    """Test getting current user with invalid token"""
    response = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalidtoken"}
    )
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]