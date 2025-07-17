from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

# Import routers (will be created in later tasks)
# from app.routers import auth, shops, products, cart, orders

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up City Shops Platform API...")
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

@app.get("/")
async def root():
    return {"message": "Welcome to City Shops Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)