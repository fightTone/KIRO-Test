from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    product_name: Optional[str] = None
    
    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    shop_id: int
    delivery_address: str
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|confirmed|preparing|ready|delivered|cancelled)$")

class OrderResponse(OrderBase):
    id: int
    customer_id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    
    class Config:
        orm_mode = True