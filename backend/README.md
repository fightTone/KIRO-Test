# City Shops Platform - Backend

This is the backend API for the City Shops Platform, built with FastAPI and SQLAlchemy.

## Database Setup

The application uses MySQL as the database. Follow these steps to set up the database:

### Prerequisites

- MySQL server installed and running
- Python 3.8+ installed

### Configuration

1. Update the `.env` file in the backend directory with your MySQL credentials:

```
# Database
DATABASE_URL=mysql+mysqlconnector://username:password@localhost/city_shops_platform

# JWT
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# App
DEBUG=True
```

Replace `username` and `password` with your MySQL credentials.

### Database Initialization

The application will automatically create the database and tables when it starts. However, you can also manually initialize the database:

```bash
# Create the database and tables
python -m backend.app.utils.db_init
```

### Database Migrations

To create and apply database migrations:

```bash
# Generate a new migration
python backend/create_migration.py

# Apply migrations
alembic upgrade head
```

### Seed Data

To populate the database with sample data:

```bash
# Seed the database with sample data
python backend/seed_db.py
```

## Running the Application

To run the application:

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run the application
python backend/main.py
```

The API will be available at http://localhost:8000.

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc