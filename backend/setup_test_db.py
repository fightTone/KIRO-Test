"""
Script to set up a test database for running tests.
This creates an in-memory SQLite database with test data.
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, Category, Shop, Product, Cart, Order, OrderItem
from app.services import auth_service
from decimal import Decimal

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def setup_test_db():
    """Set up test database with initial data"""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = TestingSessionLocal()
    
    try:
        # Create test users
        test_user = User(
            email="customer@example.com",
            username="customer",
            password_hash=auth_service.get_password_hash("password123"),
            role="customer",
            first_name="Test",
            last_name="Customer"
        )
        
        shop_owner = User(
            email="owner@example.com",
            username="shopowner",
            password_hash=auth_service.get_password_hash("password123"),
            role="shop_owner",
            first_name="Shop",
            last_name="Owner"
        )
        
        db.add_all([test_user, shop_owner])
        db.commit()
        
        # Create categories
        categories = [
            Category(name="Clothing", description="Clothing items"),
            Category(name="Electronics", description="Electronic devices"),
            Category(name="Food", description="Food items"),
            Category(name="Home", description="Home goods")
        ]
        
        db.add_all(categories)
        db.commit()
        
        # Create shop
        shop = Shop(
            owner_id=shop_owner.id,
            name="Test Shop",
            description="A test shop",
            category_id=categories[0].id,
            address="123 Test St",
            phone="123-456-7890",
            email="shop@example.com",
            is_active=True
        )
        
        db.add(shop)
        db.commit()
        
        # Create products
        products = [
            Product(
                shop_id=shop.id,
                name="T-Shirt",
                description="A cotton t-shirt",
                price=Decimal("19.99"),
                category_id=categories[0].id,
                stock_quantity=50,
                is_available=True
            ),
            Product(
                shop_id=shop.id,
                name="Jeans",
                description="Blue denim jeans",
                price=Decimal("39.99"),
                category_id=categories[0].id,
                stock_quantity=30,
                is_available=True
            ),
            Product(
                shop_id=shop.id,
                name="Headphones",
                description="Wireless headphones",
                price=Decimal("99.99"),
                category_id=categories[1].id,
                stock_quantity=20,
                is_available=True
            )
        ]
        
        db.add_all(products)
        db.commit()
        
        # Create cart items
        cart_items = [
            Cart(
                user_id=test_user.id,
                product_id=products[0].id,
                quantity=2
            ),
            Cart(
                user_id=test_user.id,
                product_id=products[1].id,
                quantity=1
            )
        ]
        
        db.add_all(cart_items)
        db.commit()
        
        # Create order
        order = Order(
            customer_id=test_user.id,
            shop_id=shop.id,
            total_amount=Decimal("159.97"),  # 19.99*2 + 39.99 + 99.99
            status="pending",
            delivery_address="456 Customer St",
            notes="Test order"
        )
        
        db.add(order)
        db.flush()
        
        # Create order items
        order_items = [
            OrderItem(
                order_id=order.id,
                product_id=products[0].id,
                quantity=2,
                price=products[0].price
            ),
            OrderItem(
                order_id=order.id,
                product_id=products[1].id,
                quantity=1,
                price=products[1].price
            ),
            OrderItem(
                order_id=order.id,
                product_id=products[2].id,
                quantity=1,
                price=products[2].price
            )
        ]
        
        db.add_all(order_items)
        db.commit()
        
        print("Test database setup complete!")
        
    except Exception as e:
        print(f"Error setting up test database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    setup_test_db()