from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import TokenData
from app.config import settings
from app.utils.auth import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Get the current authenticated user based on the JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """
    Ensure the current user is active.
    """
    # In a real application, you might have an 'is_active' field
    return current_user

async def get_shop_owner(current_user: User = Depends(get_current_user)):
    """
    Ensure the current user is a shop owner.
    """
    if current_user.role != "shop_owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Shop owner role required."
        )
    return current_user

async def get_customer(current_user: User = Depends(get_current_user)):
    """
    Ensure the current user is a customer.
    """
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized. Customer role required."
        )
    return current_user