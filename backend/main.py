from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import routers
from app.routers import auth_router, shops_router, products_router, categories_router, cart_router, orders_router
from app.utils.db_init import create_database
from app.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up City Shops Platform API...")
    
    # Initialize database
    print("Initializing database...")
    create_database()
    
    # Create tables if they don't exist
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    yield
    # Shutdown
    print("Shutting down City Shops Platform API...")

app = FastAPI(
    title="City Shops Platform API",
    description="API for the City Shops Platform - connecting local shops with customers",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(shops_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(cart_router)
app.include_router(orders_router)

@app.get("/")
async def root():
    return {"message": "Welcome to City Shops Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)