from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from app.models import Category
from app.schemas import CategoryCreate, CategoryUpdate

def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
    """
    Get all categories.
    """
    return db.query(Category).offset(skip).limit(limit).all()

def get_category(db: Session, category_id: int) -> Optional[Category]:
    """
    Get a category by ID.
    """
    return db.query(Category).filter(Category.id == category_id).first()

def get_category_by_name(db: Session, name: str) -> Optional[Category]:
    """
    Get a category by name.
    """
    return db.query(Category).filter(Category.name == name).first()

def create_category(db: Session, category: CategoryCreate) -> Tuple[Optional[Category], Optional[str]]:
    """
    Create a new category.
    """
    # Check if category with the same name already exists
    existing_category = get_category_by_name(db, category.name)
    if existing_category:
        return None, f"Category with name '{category.name}' already exists"
    
    db_category = Category(
        name=category.name,
        description=category.description
    )
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category, None

def update_category(db: Session, category_id: int, category_update: CategoryUpdate) -> Optional[Category]:
    """
    Update a category.
    """
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        return None
    
    # Check if updating to a name that already exists
    if category_update.name and category_update.name != db_category.name:
        existing_category = get_category_by_name(db, category_update.name)
        if existing_category:
            return None
    
    # Update category attributes
    update_data = category_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int) -> bool:
    """
    Delete a category.
    """
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        return False
    
    db.delete(db_category)
    db.commit()
    return True