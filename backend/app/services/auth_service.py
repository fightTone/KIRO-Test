from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.config import settings
from app.models import User
from app.schemas import TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Generate a password hash."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_user_by_email(db: Session, email: str):
    """Get a user by email."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    """Get a user by username."""
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user_data):
    """Create a new user."""
    # Check if user with email or username already exists
    existing_email = get_user_by_email(db, user_data.email)
    if existing_email:
        return None, "Email already registered"
    
    existing_username = get_user_by_username(db, user_data.username)
    if existing_username:
        return None, "Username already taken"
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        role=user_data.role,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        address=user_data.address
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user, None

def authenticate_user(db: Session, username: str, password: str):
    """Authenticate a user by username and password."""
    # Try to find user by username
    user = get_user_by_username(db, username)
    
    # If not found by username, try email
    if not user:
        user = get_user_by_email(db, username)
    
    # If user not found or password doesn't match
    if not user or not verify_password(password, user.password_hash):
        return False
    
    return user