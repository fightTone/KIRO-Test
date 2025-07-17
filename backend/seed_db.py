import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from app.database import SessionLocal
from app.utils.db_init import create_database
from app.utils.seed_data import seed_data

# Load environment variables
load_dotenv()

def main():
    """
    Initialize the database and seed it with sample data
    """
    print("Initializing database...")
    if create_database():
        print("Database initialized successfully.")
        
        # Create a database session
        db = SessionLocal()
        try:
            # Seed the database with sample data
            seed_data(db)
        finally:
            db.close()
    else:
        print("Failed to initialize database.")
        sys.exit(1)

if __name__ == "__main__":
    main()