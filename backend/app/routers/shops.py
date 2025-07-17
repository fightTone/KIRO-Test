from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas import ShopCreate, ShopResponse, ShopUpdate
from app.models import User
from app.services import get_shops, get_shop, get_shop_by_owner, create_shop, update_shop, delete_shop
from app.utils.auth_middleware import get_shop_owner, get_current_user

router = APIRouter(
    prefix="/shops",
    tags=["shops"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[ShopResponse])
async def read_shops(
    category_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all shops with optional category filtering.
    """
    shops = get_shops(db, category_id=category_id, skip=skip, limit=limit)
    return shops

@router.post("/", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
async def create_new_shop(
    shop: ShopCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_shop_owner)
):
    """
    Create a new shop (shop owners only).
    """
    return create_shop(db, shop, current_user.id)

@router.get("/{shop_id}", response_model=ShopResponse)
async def read_shop(shop_id: int, db: Session = Depends(get_db)):
    """
    Get details for a specific shop.
    """
    db_shop = get_shop(db, shop_id)
    if db_shop is None:
        raise HTTPException(status_code=404, detail="Shop not found")
    return db_shop

@router.put("/{shop_id}", response_model=ShopResponse)
async def update_shop_details(
    shop_id: int, 
    shop_update: ShopUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a shop (owner only).
    """
    # Check if shop exists and belongs to the current user
    db_shop = get_shop_by_owner(db, current_user.id, shop_id)
    if db_shop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop not found or you don't have permission to update it"
        )
    
    # Update shop
    updated_shop = update_shop(db, shop_id, shop_update)
    return updated_shop

@router.delete("/{shop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shop_endpoint(
    shop_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a shop (owner only).
    """
    # Check if shop exists and belongs to the current user
    db_shop = get_shop_by_owner(db, current_user.id, shop_id)
    if db_shop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop not found or you don't have permission to delete it"
        )
    
    # Delete shop
    success = delete_shop(db, shop_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete shop"
        )
    
    return None