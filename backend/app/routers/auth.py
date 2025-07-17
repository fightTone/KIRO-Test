from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserCreate, UserResponse, Token
from app.services import auth_service

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={401: {"description": "Unauthorized"}},
)

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user with the provided information.
    """
    # This will be implemented in a later task
    return {"message": "User registration endpoint"}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT token.
    """
    # This will be implemented in a later task
    return {"message": "User login endpoint"}

@router.get("/me", response_model=UserResponse)
async def get_current_user():
    """
    Get information about the currently authenticated user.
    """
    # This will be implemented in a later task
    return {"message": "Get current user endpoint"}