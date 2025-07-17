from sqlalchemy.orm import Session
from app.models import User, Category, Shop, Product
from passlib.context import CryptContext
from decimal import Decimal

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_data(db: Session):
    """
    Seed the database with initial data for testing
    """
    print("Seeding database with initial data...")
    
    # Check if data already exists
    if db.query(User).count() > 0:
        print("Database already contains data. Skipping seed operation.")
        return
    
    # Create users
    print("Creating users...")
    users = [
        User(
            email="admin@cityshops.com",
            username="admin",
            password_hash=pwd_context.hash("admin123"),
            role="shop_owner",
            first_name="Admin",
            last_name="User",
            phone="555-1234",
            address="123 Admin St, City"
        ),
        User(
            email="customer@example.com",
            username="customer",
            password_hash=pwd_context.hash("customer123"),
            role="customer",
            first_name="Test",
            last_name="Customer",
            phone="555-5678",
            address="456 Customer Ave, City"
        ),
        User(
            email="shop1@example.com",
            username="shopowner1",
            password_hash=pwd_context.hash("shop123"),
            role="shop_owner",
            first_name="Shop",
            last_name="Owner",
            phone="555-9012",
            address="789 Shop Blvd, City"
        )
    ]
    db.add_all(users)
    db.commit()
    
    # Create categories
    print("Creating categories...")
    categories = [
        Category(name="Bakery", description="Fresh bread and pastries"),
        Category(name="Grocery", description="Fresh produce and pantry items"),
        Category(name="Butcher", description="Quality meats and poultry"),
        Category(name="Cafe", description="Coffee, tea, and light meals"),
        Category(name="Bookstore", description="Books, magazines, and stationery")
    ]
    db.add_all(categories)
    db.commit()
    
    # Create shops
    print("Creating shops...")
    shops = [
        Shop(
            owner_id=1,
            name="Admin's Bakery",
            description="Artisanal bread and pastries made fresh daily",
            category_id=1,
            address="123 Baker St, City",
            phone="555-1111",
            email="bakery@example.com",
            image_url="https://example.com/bakery.jpg",
            is_active=True
        ),
        Shop(
            owner_id=3,
            name="Fresh Groceries",
            description="Local and organic produce",
            category_id=2,
            address="456 Market St, City",
            phone="555-2222",
            email="grocery@example.com",
            image_url="https://example.com/grocery.jpg",
            is_active=True
        ),
        Shop(
            owner_id=3,
            name="City Books",
            description="Independent bookstore with a wide selection",
            category_id=5,
            address="789 Read St, City",
            phone="555-3333",
            email="books@example.com",
            image_url="https://example.com/bookstore.jpg",
            is_active=True
        )
    ]
    db.add_all(shops)
    db.commit()
    
    # Create products
    print("Creating products...")
    products = [
        # Bakery products
        Product(
            shop_id=1,
            name="Sourdough Bread",
            description="Traditional sourdough bread made with our own starter",
            price=Decimal("5.99"),
            category_id=1,
            image_url="https://example.com/sourdough.jpg",
            stock_quantity=20,
            is_available=True
        ),
        Product(
            shop_id=1,
            name="Croissant",
            description="Buttery, flaky French pastry",
            price=Decimal("2.99"),
            category_id=1,
            image_url="https://example.com/croissant.jpg",
            stock_quantity=30,
            is_available=True
        ),
        # Grocery products
        Product(
            shop_id=2,
            name="Organic Apples",
            description="Fresh, locally grown organic apples",
            price=Decimal("3.99"),
            category_id=2,
            image_url="https://example.com/apples.jpg",
            stock_quantity=50,
            is_available=True
        ),
        Product(
            shop_id=2,
            name="Free-Range Eggs",
            description="Dozen free-range eggs from local farms",
            price=Decimal("4.99"),
            category_id=2,
            image_url="https://example.com/eggs.jpg",
            stock_quantity=40,
            is_available=True
        ),
        # Bookstore products
        Product(
            shop_id=3,
            name="Bestseller Novel",
            description="Latest bestselling fiction novel",
            price=Decimal("14.99"),
            category_id=5,
            image_url="https://example.com/novel.jpg",
            stock_quantity=15,
            is_available=True
        ),
        Product(
            shop_id=3,
            name="Cooking Cookbook",
            description="Collection of recipes from around the world",
            price=Decimal("24.99"),
            category_id=5,
            image_url="https://example.com/cookbook.jpg",
            stock_quantity=10,
            is_available=True
        )
    ]
    db.add_all(products)
    db.commit()
    
    print("Database seeding completed successfully!")