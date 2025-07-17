from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from decimal import Decimal
from app.database import get_db
from app.schemas import OrderCreate, OrderResponse, OrderUpdate, OrderItemResponse
from app.models import Order, OrderItem, Cart, Product, Shop, User
from app.utils.auth_middleware import get_current_user, get_shop_owner, get_customer

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    shop_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get orders for the current user (customers) or shop (owners).
    """
    query = db.query(Order)
    
    # Filter based on user role
    if current_user.role == "customer":
        # Customers can only see their own orders
        query = query.filter(Order.customer_id == current_user.id)
        
        # Optional shop filter for customers
        if shop_id:
            query = query.filter(Order.shop_id == shop_id)
    
    elif current_user.role == "shop_owner":
        # Shop owners can only see orders for their shops
        shops = db.query(Shop.id).filter(Shop.owner_id == current_user.id)
        
        # If shop_id is provided, verify it belongs to the current user
        if shop_id:
            shop = db.query(Shop).filter(Shop.id == shop_id, Shop.owner_id == current_user.id).first()
            if not shop:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have access to this shop's orders"
                )
            query = query.filter(Order.shop_id == shop_id)
        else:
            # Get orders for all shops owned by the user
            query = query.filter(Order.shop_id.in_(shops))
    
    # Filter by status if provided
    if status:
        valid_statuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        query = query.filter(Order.status == status)
    
    # Apply pagination
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    # Load order items for each order
    result = []
    for order in orders:
        # Get order items with product details
        items_query = db.query(OrderItem, Product.name.label("product_name")) \
            .join(Product, OrderItem.product_id == Product.id) \
            .filter(OrderItem.order_id == order.id)
        
        items = []
        for item, product_name in items_query:
            items.append(OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
                product_name=product_name
            ))
        
        # Create order response with items
        order_response = OrderResponse(
            id=order.id,
            customer_id=order.customer_id,
            shop_id=order.shop_id,
            total_amount=order.total_amount,
            status=order.status,
            delivery_address=order.delivery_address,
            notes=order.notes,
            created_at=order.created_at,
            updated_at=order.updated_at,
            items=items
        )
        
        result.append(order_response)
    
    return result

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate, current_user: User = Depends(get_customer), db: Session = Depends(get_db)):
    """
    Create a new order from cart items.
    """
    # Check if shop exists
    shop = db.query(Shop).filter(Shop.id == order.shop_id).first()
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shop with id {order.shop_id} not found"
        )
    
    # Get cart items for the specified shop
    cart_items = db.query(Cart, Product) \
        .join(Product) \
        .filter(
            Cart.user_id == current_user.id,
            Product.shop_id == order.shop_id
        ).all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No items in cart for the specified shop"
        )
    
    # Calculate total amount
    total_amount = Decimal('0.00')
    order_items = []
    
    for cart_item, product in cart_items:
        # Check if product is available
        if not product.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.name}' is not available"
            )
        
        # Check if product has enough stock
        if product.stock_quantity < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for product '{product.name}'. Requested: {cart_item.quantity}, Available: {product.stock_quantity}"
            )
        
        # Calculate item total
        item_total = product.price * cart_item.quantity
        total_amount += item_total
        
        # Create order item
        order_items.append({
            "product_id": product.id,
            "quantity": cart_item.quantity,
            "price": product.price
        })
        
        # Update product stock
        product.stock_quantity -= cart_item.quantity
    
    # Create order
    new_order = Order(
        customer_id=current_user.id,
        shop_id=order.shop_id,
        total_amount=total_amount,
        delivery_address=order.delivery_address,
        notes=order.notes,
        status="pending"
    )
    
    db.add(new_order)
    db.flush()  # Get the order ID without committing
    
    # Create order items
    db_order_items = []
    for item in order_items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["price"]
        )
        db.add(order_item)
        db_order_items.append(order_item)
    
    # Remove items from cart
    for cart_item, _ in cart_items:
        db.delete(cart_item)
    
    # Commit all changes
    db.commit()
    db.refresh(new_order)
    
    # Format response
    items = []
    for item in db_order_items:
        product_name = db.query(Product.name).filter(Product.id == item.product_id).scalar()
        items.append(OrderItemResponse(
            id=item.id,
            order_id=item.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price,
            product_name=product_name
        ))
    
    return OrderResponse(
        id=new_order.id,
        customer_id=new_order.customer_id,
        shop_id=new_order.shop_id,
        total_amount=new_order.total_amount,
        status=new_order.status,
        delivery_address=new_order.delivery_address,
        notes=new_order.notes,
        created_at=new_order.created_at,
        updated_at=new_order.updated_at,
        items=items
    )

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get details for a specific order.
    """
    # Get order
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    
    # Check if user has access to this order
    if current_user.role == "customer" and order.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this order"
        )
    elif current_user.role == "shop_owner":
        # Check if the order belongs to one of the user's shops
        shop = db.query(Shop).filter(Shop.id == order.shop_id, Shop.owner_id == current_user.id).first()
        if not shop:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this order"
            )
    
    # Get order items with product details
    items_query = db.query(OrderItem, Product.name.label("product_name")) \
        .join(Product, OrderItem.product_id == Product.id) \
        .filter(OrderItem.order_id == order.id)
    
    items = []
    for item, product_name in items_query:
        items.append(OrderItemResponse(
            id=item.id,
            order_id=item.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price,
            product_name=product_name
        ))
    
    # Create order response with items
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        shop_id=order.shop_id,
        total_amount=order.total_amount,
        status=order.status,
        delivery_address=order.delivery_address,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=items
    )

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order_status(order_id: int, order_update: OrderUpdate, current_user: User = Depends(get_shop_owner), db: Session = Depends(get_db)):
    """
    Update an order status (shop owners only).
    """
    # Get order
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )
    
    # Check if the order belongs to one of the user's shops
    shop = db.query(Shop).filter(Shop.id == order.shop_id, Shop.owner_id == current_user.id).first()
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this order"
        )
    
    # Validate status transition
    valid_statuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]
    if order_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Update order status
    order.status = order_update.status
    db.commit()
    db.refresh(order)
    
    # Get order items with product details
    items_query = db.query(OrderItem, Product.name.label("product_name")) \
        .join(Product, OrderItem.product_id == Product.id) \
        .filter(OrderItem.order_id == order.id)
    
    items = []
    for item, product_name in items_query:
        items.append(OrderItemResponse(
            id=item.id,
            order_id=item.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price,
            product_name=product_name
        ))
    
    # Create order response with items
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        shop_id=order.shop_id,
        total_amount=order.total_amount,
        status=order.status,
        delivery_address=order.delivery_address,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=items
    )