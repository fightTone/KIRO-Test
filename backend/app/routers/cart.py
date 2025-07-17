from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from app.database import get_db
from app.schemas import CartItemCreate, CartItemUpdate, CartItemResponse, CartSummary
from app.models import Cart, Product, User
from app.utils.auth_middleware import get_customer

router = APIRouter(
    prefix="/cart",
    tags=["cart"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=CartSummary)
async def get_cart(current_user: User = Depends(get_customer), db: Session = Depends(get_db)):
    """
    Get the current user's cart items.
    """
    # Get cart items with product details
    cart_items = db.query(Cart, Product).join(Product).filter(Cart.user_id == current_user.id).all()
    
    # Format response
    items = []
    total_amount = Decimal('0.00')
    
    for cart_item, product in cart_items:
        item_total = product.price * cart_item.quantity
        total_amount += item_total
        
        items.append(CartItemResponse(
            id=cart_item.id,
            user_id=cart_item.user_id,
            product_id=product.id,
            quantity=cart_item.quantity,
            product_name=product.name,
            product_price=product.price,
            total_price=item_total
        ))
    
    return CartSummary(
        items=items,
        total_items=len(items),
        total_amount=total_amount
    )

@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(item: CartItemCreate, current_user: User = Depends(get_customer), db: Session = Depends(get_db)):
    """
    Add an item to the cart.
    """
    # Check if product exists
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {item.product_id} not found"
        )
    
    # Check if product is available
    if not product.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with id {item.product_id} is not available"
        )
    
    # Check if product has enough stock
    if product.stock_quantity < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough stock available. Requested: {item.quantity}, Available: {product.stock_quantity}"
        )
    
    # Check if item already exists in cart
    existing_item = db.query(Cart).filter(
        Cart.user_id == current_user.id,
        Cart.product_id == item.product_id
    ).first()
    
    if existing_item:
        # Update quantity if item already exists
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
        cart_item = existing_item
    else:
        # Create new cart item
        cart_item = Cart(
            user_id=current_user.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)
    
    # Return formatted response
    return CartItemResponse(
        id=cart_item.id,
        user_id=cart_item.user_id,
        product_id=product.id,
        quantity=cart_item.quantity,
        product_name=product.name,
        product_price=product.price,
        total_price=product.price * cart_item.quantity
    )

@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_cart_item(item_id: int, item: CartItemUpdate, current_user: User = Depends(get_customer), db: Session = Depends(get_db)):
    """
    Update the quantity of a cart item.
    """
    # Get cart item
    cart_item = db.query(Cart).filter(Cart.id == item_id, Cart.user_id == current_user.id).first()
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cart item with id {item_id} not found"
        )
    
    # Get product
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {cart_item.product_id} not found"
        )
    
    # Check if product has enough stock
    if product.stock_quantity < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough stock available. Requested: {item.quantity}, Available: {product.stock_quantity}"
        )
    
    # Update quantity
    cart_item.quantity = item.quantity
    db.commit()
    db.refresh(cart_item)
    
    # Return formatted response
    return CartItemResponse(
        id=cart_item.id,
        user_id=cart_item.user_id,
        product_id=product.id,
        quantity=cart_item.quantity,
        product_name=product.name,
        product_price=product.price,
        total_price=product.price * cart_item.quantity
    )

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(item_id: int, current_user: User = Depends(get_customer), db: Session = Depends(get_db)):
    """
    Remove an item from the cart.
    """
    # Get cart item
    cart_item = db.query(Cart).filter(Cart.id == item_id, Cart.user_id == current_user.id).first()
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cart item with id {item_id} not found"
        )
    
    # Delete cart item
    db.delete(cart_item)
    db.commit()
    
    return None

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(current_user: User = Depends(get_customer), db: Session = Depends(get_db)):
    """
    Clear the entire cart.
    """
    # Delete all cart items for the current user
    db.query(Cart).filter(Cart.user_id == current_user.id).delete()
    db.commit()
    
    return None