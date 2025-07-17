import os
import sqlite3
import re
from dotenv import load_dotenv, find_dotenv

# Load environment variables from .env file
dotenv_path = find_dotenv()
load_dotenv(dotenv_path)

# Import settings after loading environment variables
from app.config import settings

def create_database():
    """
    Create the SQLite database if it doesn't exist.
    """
    print(f"DATABASE_URL: {settings.DATABASE_URL}")
    
    # Check if using SQLite
    if settings.DATABASE_URL.startswith('sqlite:///'):
        # Extract database path from DATABASE_URL
        db_path_match = re.search(r'sqlite:///(.+)', settings.DATABASE_URL)
        if not db_path_match:
            print("Could not extract database path from DATABASE_URL")
            print("Make sure DATABASE_URL starts with 'sqlite:///'")
            return
        
        db_path = db_path_match.group(1)
        print(f"Extracted database path: {db_path}")
        
        # If path starts with ./, make it relative to current directory
        if db_path.startswith('./'):
            db_path = os.path.join(os.getcwd(), db_path[2:])
            print(f"Resolved path: {db_path}")
        
        # Check if database file already exists
        if os.path.exists(db_path):
            print(f"Database '{db_path}' already exists")
            return
        
        try:
            # Create a new SQLite database
            conn = sqlite3.connect(db_path)
            print(f"Database '{db_path}' created successfully")
            conn.close()
            print("SQLite connection is closed")
            
        except Exception as e:
            print(f"Error while creating SQLite database: {e}")
    else:
        print("Not using SQLite, no need to create database file")
        print("Make sure your database server is running and the database exists")

if __name__ == "__main__":
    create_database()