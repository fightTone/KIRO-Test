from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    category_id: int
    image_url: Optional[str] = None
    stock_quantity: int = Field(0, ge=0)
    is_available: bool = True

class ProductCreate(ProductBase):
    shop_id: int

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_available: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    shop_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True