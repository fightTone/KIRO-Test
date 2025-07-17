from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItemResponse(CartItemBase):
    id: int
    user_id: int
    product_name: str
    product_price: Decimal
    total_price: Decimal
    
    class Config:
        orm_mode = True

class CartSummary(BaseModel):
    items: List[CartItemResponse]
    total_items: int
    total_amount: Decimal