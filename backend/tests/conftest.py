import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from main import app
from app.utils.auth_middleware import get_current_user, get_customer, get_shop_owner

# Import fixtures from test_fixtures.py
from tests.test_fixtures import (
    test_user, shop_owner, test_categories, test_shop, 
    test_products, shop_owner_token, customer_token
)

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    
    # Drop tables after test
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    # Override the get_db dependency to use the test database
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Reset dependency override
    app.dependency_overrides = {}

@pytest.fixture(scope="function")
def auth_client(client, db_session, test_user):
    """Client with authentication overrides for testing protected routes"""
    
    # Override authentication dependencies
    def override_get_current_user():
        return test_user
        
    def override_get_customer():
        return test_user
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_customer] = override_get_customer
    
    yield client
    
    # Reset dependency overrides
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_customer, None)

@pytest.fixture(scope="function")
def shop_owner_client(client, db_session, shop_owner):
    """Client with shop owner authentication overrides for testing protected routes"""
    
    # Override authentication dependencies
    def override_get_current_user():
        return shop_owner
        
    def override_get_shop_owner():
        return shop_owner
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_shop_owner] = override_get_shop_owner
    
    yield client
    
    # Reset dependency overrides
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_shop_owner, None)