from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import CategoryCreate, CategoryResponse, CategoryUpdate

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    """
    Get all categories.
    """
    # This will be implemented in a later task
    return []

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """
    Create a new category (admin only).
    """
    # This will be implemented in a later task
    return {"message": "Create category endpoint"}

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """
    Get details for a specific category.
    """
    # This will be implemented in a later task
    return {"message": f"Get category {category_id} endpoint"}

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    """
    Update a category (admin only).
    """
    # This will be implemented in a later task
    return {"message": f"Update category {category_id} endpoint"}

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, db: Session = Depends(get_db)):
    """
    Delete a category (admin only).
    """
    # This will be implemented in a later task
    return {"message": f"Delete category {category_id} endpoint"}