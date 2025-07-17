from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Tuple
from app.models import Shop, User
from app.schemas import ShopCreate, ShopUpdate

def get_shops(
    db: Session, 
    category_id: Optional[int] = None, 
    skip: int = 0, 
    limit: int = 100
) -> List[Shop]:
    """
    Get all shops with optional category filtering.
    """
    query = db.query(Shop)
    
    if category_id:
        query = query.filter(Shop.category_id == category_id)
    
    return query.offset(skip).limit(limit).all()

def get_shop(db: Session, shop_id: int) -> Optional[Shop]:
    """
    Get a shop by ID.
    """
    return db.query(Shop).filter(Shop.id == shop_id).first()

def get_shop_by_owner(db: Session, owner_id: int, shop_id: int) -> Optional[Shop]:
    """
    Get a shop by ID and owner ID to verify ownership.
    """
    return db.query(Shop).filter(Shop.id == shop_id, Shop.owner_id == owner_id).first()

def create_shop(db: Session, shop: ShopCreate, owner_id: int) -> Shop:
    """
    Create a new shop.
    """
    db_shop = Shop(
        owner_id=owner_id,
        name=shop.name,
        description=shop.description,
        category_id=shop.category_id,
        address=shop.address,
        phone=shop.phone,
        email=shop.email,
        image_url=shop.image_url,
        is_active=True
    )
    
    db.add(db_shop)
    db.commit()
    db.refresh(db_shop)
    return db_shop

def update_shop(db: Session, shop_id: int, shop_update: ShopUpdate) -> Optional[Shop]:
    """
    Update a shop.
    """
    db_shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not db_shop:
        return None
    
    # Update shop attributes
    update_data = shop_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_shop, key, value)
    
    db.commit()
    db.refresh(db_shop)
    return db_shop

def delete_shop(db: Session, shop_id: int) -> bool:
    """
    Delete a shop.
    """
    db_shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not db_shop:
        return False
    
    db.delete(db_shop)
    db.commit()
    return True