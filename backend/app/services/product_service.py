from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from app.models import Product, Shop
from app.schemas import ProductCreate, ProductUpdate

def get_products(
    db: Session, 
    shop_id: Optional[int] = None, 
    category_id: Optional[int] = None, 
    skip: int = 0, 
    limit: int = 100
) -> List[Product]:
    """
    Get all products with optional shop and category filtering.
    """
    query = db.query(Product)
    
    if shop_id:
        query = query.filter(Product.shop_id == shop_id)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    return query.offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int) -> Optional[Product]:
    """
    Get a product by ID.
    """
    return db.query(Product).filter(Product.id == product_id).first()

def get_product_by_shop_owner(db: Session, product_id: int, owner_id: int) -> Optional[Product]:
    """
    Get a product by ID and verify it belongs to a shop owned by the specified owner.
    """
    return db.query(Product).join(Shop).filter(
        Product.id == product_id,
        Shop.owner_id == owner_id
    ).first()

def create_product(db: Session, product: ProductCreate) -> Product:
    """
    Create a new product.
    """
    db_product = Product(
        shop_id=product.shop_id,
        name=product.name,
        description=product.description,
        price=product.price,
        category_id=product.category_id,
        image_url=product.image_url,
        stock_quantity=product.stock_quantity,
        is_available=product.is_available
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: ProductUpdate) -> Optional[Product]:
    """
    Update a product.
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        return None
    
    # Update product attributes
    update_data = product_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int) -> bool:
    """
    Delete a product.
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        return False
    
    db.delete(db_product)
    db.commit()
    return True