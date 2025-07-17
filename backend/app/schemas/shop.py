from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ShopBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category_id: int
    address: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    image_url: Optional[str] = None

class ShopCreate(ShopBase):
    pass

class ShopUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category_id: Optional[int] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ShopResponse(ShopBase):
    id: int
    owner_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True