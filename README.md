# City Shops Platform

A platform connecting local shops with customers in the city.

## Project Structure

- `backend/`: FastAPI backend
- `frontend/`: React frontend with TypeScript

## Backend Setup

1. Create a virtual environment:
   ```
   cd backend
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE city_shops_platform;
   exit;
   
   # Run migrations
   alembic upgrade head
   ```

5. Run the development server:
   ```
   uvicorn main:app --reload
   ```

6. Access the API documentation at http://localhost:8000/docs

## Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Run the development server:
   ```
   npm start
   ```

3. Access the application at http://localhost:3000

## Features

- User authentication (customers and shop owners)
- Shop management for shop owners
- Product catalog
- Shopping cart
- Order management
- Categories for shops and products