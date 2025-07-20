"""
Database optimization script to add indexes for better query performance.
"""
from sqlalchemy import create_engine, text
from app.config import settings

def add_database_indexes():
    """
    Add indexes to improve query performance for common operations.
    """
    print("Adding database indexes for optimization...")
    
    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    
    # List of indexes to create
    indexes = [
        # Users table indexes
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
        "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
        "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
        
        # Shops table indexes
        "CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id)",
        "CREATE INDEX IF NOT EXISTS idx_shops_category_id ON shops(category_id)",
        "CREATE INDEX IF NOT EXISTS idx_shops_is_active ON shops(is_active)",
        
        # Products table indexes
        "CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id)",
        "CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)",
        "CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available)",
        "CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)",
        
        # Carts table indexes
        "CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_carts_product_id ON carts(product_id)",
        
        # Orders table indexes
        "CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)",
        "CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id)",
        "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)",
        "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)",
        
        # Order items table indexes
        "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)",
        "CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)",
    ]
    
    # Execute each index creation statement
    with engine.connect() as connection:
        for index_sql in indexes:
            try:
                connection.execute(text(index_sql))
                print(f"Created index: {index_sql}")
            except Exception as e:
                print(f"Error creating index: {e}")
    
    print("Database optimization complete!")

if __name__ == "__main__":
    add_database_indexes()