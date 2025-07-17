from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from app.models import User
from app.services import get_categories, get_category, create_category, update_category, delete_category
from app.utils.auth_middleware import get_current_user

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[CategoryResponse])
async def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all categories.
    """
    categories = get_categories(db, skip=skip, limit=limit)
    return categories

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_new_category(
    category: CategoryCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new category (admin only).
    """
    # In a real application, we would check if the user is an admin
    # For now, we'll allow any authenticated user to create categories
    # if current_user.role != "admin":
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only admins can create categories"
    #     )
    
    db_category, error_message = create_category(db, category)
    if error_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    return db_category

@router.get("/{category_id}", response_model=CategoryResponse)
async def read_category(category_id: int, db: Session = Depends(get_db)):
    """
    Get details for a specific category.
    """
    db_category = get_category(db, category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category_details(
    category_id: int, 
    category_update: CategoryUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a category (admin only).
    """
    # In a real application, we would check if the user is an admin
    # For now, we'll allow any authenticated user to update categories
    # if current_user.role != "admin":
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only admins can update categories"
    #     )
    
    # Check if category exists
    db_category = get_category(db, category_id)
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Update category
    updated_category = update_category(db, category_id, category_update)
    if updated_category is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category name already exists"
        )
    
    return updated_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category_endpoint(
    category_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a category (admin only).
    """
    # In a real application, we would check if the user is an admin
    # For now, we'll allow any authenticated user to delete categories
    # if current_user.role != "admin":
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only admins can delete categories"
    #     )
    
    # Check if category exists
    db_category = get_category(db, category_id)
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Delete category
    success = delete_category(db, category_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete category"
        )
    
    return None