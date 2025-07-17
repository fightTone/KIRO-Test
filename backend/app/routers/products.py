from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas import ProductCreate, ProductResponse, ProductUpdate
from app.models import User, Shop
from app.services import (
    get_products, 
    get_product, 
    get_product_by_shop_owner, 
    create_product, 
    update_product, 
    delete_product,
    get_shop_by_owner
)
from app.utils.auth_middleware import get_shop_owner, get_current_user

router = APIRouter(
    prefix="/products",
    tags=["products"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[ProductResponse])
async def read_products(
    shop_id: Optional[int] = None,
    category_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all products with optional shop and category filtering.
    """
    products = get_products(db, shop_id=shop_id, category_id=category_id, skip=skip, limit=limit)
    return products

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_new_product(
    product: ProductCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_shop_owner)
):
    """
    Create a new product (shop owners only).
    """
    # Verify that the shop belongs to the current user
    shop = get_shop_by_owner(db, current_user.id, product.shop_id)
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add products to shops you own"
        )
    
    return create_product(db, product)

@router.get("/{product_id}", response_model=ProductResponse)
async def read_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get details for a specific product.
    """
    db_product = get_product(db, product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product_details(
    product_id: int, 
    product_update: ProductUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a product (owner only).
    """
    # Check if product exists and belongs to a shop owned by the current user
    db_product = get_product_by_shop_owner(db, product_id, current_user.id)
    if db_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to update it"
        )
    
    # Update product
    updated_product = update_product(db, product_id, product_update)
    return updated_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_endpoint(
    product_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a product (owner only).
    """
    # Check if product exists and belongs to a shop owned by the current user
    db_product = get_product_by_shop_owner(db, product_id, current_user.id)
    if db_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission to delete it"
        )
    
    # Delete product
    success = delete_product(db, product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product"
        )
    
    return None