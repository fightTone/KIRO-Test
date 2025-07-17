import os
import sys
from dotenv import load_dotenv, find_dotenv

# Print current working directory
print(f"Current working directory: {os.getcwd()}")

# Find .env file
dotenv_path = find_dotenv()
print(f"Found .env file at: {dotenv_path}")

# Load environment variables from .env file
load_dotenv(dotenv_path)

# Print the DATABASE_URL
print(f"DATABASE_URL from environment: {os.getenv('DATABASE_URL')}")

# Import settings from config
from app.config import settings

# Print the DATABASE_URL from settings
print(f"DATABASE_URL from settings: {settings.DATABASE_URL}")

# Print Python path
print(f"Python path: {sys.path}")