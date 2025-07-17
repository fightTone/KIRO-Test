import mysql.connector
from mysql.connector import Error
from app.config import settings
import re

def create_database():
    """
    Create the database if it doesn't exist.
    """
    # Extract database name from DATABASE_URL
    db_name_match = re.search(r'/([^/]+)$', settings.DATABASE_URL)
    if not db_name_match:
        print("Could not extract database name from DATABASE_URL")
        return
    
    db_name = db_name_match.group(1)
    
    # Extract host, user, password from DATABASE_URL
    host_match = re.search(r'@([^/:]+)', settings.DATABASE_URL)
    host = host_match.group(1) if host_match else "localhost"
    
    user_match = re.search(r'://([^:]+):', settings.DATABASE_URL)
    user = user_match.group(1) if user_match else "root"
    
    password_match = re.search(r':([^@]+)@', settings.DATABASE_URL)
    password = password_match.group(1) if password_match else "secret"
    
    try:
        # Connect to MySQL server without specifying a database
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database if it doesn't exist
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
            print(f"Database '{db_name}' created or already exists")
            
            cursor.close()
            connection.close()
            print("MySQL connection is closed")
            
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")

if __name__ == "__main__":
    create_database()