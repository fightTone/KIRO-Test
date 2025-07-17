# Import utility functions and modules
from app.utils.db_init import create_database
from app.utils.auth_middleware import (
    get_current_user,
    get_current_active_user,
    get_shop_owner,
    get_customer
)

# Export all utilities to be used in the application