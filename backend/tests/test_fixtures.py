import pytest
from app.services import auth_service
from app.models import User, Category, Shop, Product
from decimal import Decimal

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

@pytest.fixture(scope="function")
def shop_owner(db_session):
    # Create a shop owner user
    shop_owner = User(
        email="owner@example.com",
        username="shopowner",
        password_hash=auth_service.get_password_hash("password123"),
        role="shop_owner",
        first_name="Shop",
        last_name="Owner"
    )
    db_session.add(shop_owner)
    db_session.commit()
    
    return shop_owner

@pytest.fixture(scope="function")
def test_categories(db_session):
    # Create test categories
    categories = [
        Category(name="Clothing", description="Clothing items"),
        Category(name="Food", description="Food items"),
        Category(name="Electronics", description="Electronic devices")
    ]
    
    db_session.add_all(categories)
    db_session.commit()
    
    return categories

@pytest.fixture(scope="function")
def test_shop(db_session, shop_owner, test_categories):
    # Create a test shop
    shop = Shop(
        owner_id=shop_owner.id,
        name="Test Shop",
        description="A test shop",
        category_id=test_categories[0].id,
        address="123 Test St",
        phone="123-456-7890",
        email="shop@example.com",
        is_active=True
    )
    
    db_session.add(shop)
    db_session.commit()
    
    return shop

@pytest.fixture(scope="function")
def test_products(db_session, test_shop, test_categories):
    # Create test products
    products = [
        Product(
            shop_id=test_shop.id,
            name="Product 1",
            description="Description for product 1",
            price=Decimal("19.99"),
            category_id=test_categories[0].id,
            stock_quantity=10,
            is_available=True
        ),
        Product(
            shop_id=test_shop.id,
            name="Product 2",
            description="Description for product 2",
            price=Decimal("29.99"),
            category_id=test_categories[1].id,
            stock_quantity=5,
            is_available=True
        )
    ]
    
    db_session.add_all(products)
    db_session.commit()
    
    return products

@pytest.fixture(scope="function")
def shop_owner_token(client, shop_owner):
    # Get token for shop owner
    response = client.post(
        "/auth/login",
        data={"username": "shopowner", "password": "password123"}
    )
    return response.json()["access_token"]

@pytest.fixture(scope="function")
def customer_token(client, test_user):
    # Get token for customer
    response = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "password123"}
    )
    return response.json()["access_token"]