import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Product, Category, Shop } from '../../types';
import { getMyShop } from '../../services/shopManagementService';
import { getShopProducts, createProduct, updateProduct, deleteProduct, ProductCreate, ProductUpdate } from '../../services/productManagementService';
import { getCategories } from '../../services/shopService';
import { getProduct } from '../../services/productService';
import './ProductManagementPage.css';

const ProductManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isEditMode = !!productId;
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<Record<string, string>>({});
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    stock_quantity: 0,
    is_available: true,
    image_url: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load shop data
        const shopData = await getMyShop();
        if (!shopData) {
          navigate('/shop-management');
          return;
        }
        setShop(shopData);
        
        // Load categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Load products for this shop
        const productsData = await getShopProducts(shopData.id);
        setProducts(productsData);
        
        // If editing, load product data
        if (isEditMode && productId) {
          const productData = await getProduct(parseInt(productId));
          
          // Verify product belongs to this shop
          if (productData.shop_id !== shopData.id) {
            navigate('/product-management');
            return;
          }
          
          setProduct(productData);
          setFormData({
            name: productData.name,
            description: productData.description || '',
            price: productData.price,
            category_id: productData.category_id,
            stock_quantity: productData.stock_quantity,
            is_available: productData.is_available,
            image_url: productData.image_url || '',
          });
          setShowProductForm(true);
        } else if (categoriesData.length > 0) {
          // Set default category if creating new product
          setFormData(prev => ({
            ...prev,
            category_id: categoriesData[0].id
          }));
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role.toLowerCase() === 'shop_owner') {
      loadData();
    } else {
      navigate('/');
    }
  }, [user, navigate, productId, isEditMode]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than zero';
    }
    
    if (formData.category_id <= 0) {
      errors.category_id = 'Please select a category';
    }
    
    if (formData.stock_quantity < 0) {
      errors.stock_quantity = 'Stock quantity cannot be negative';
    }
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: string | number | boolean = value;
    
    // Handle different input types
    if (type === 'number') {
      parsedValue = value === '' ? 0 : parseFloat(value);
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'category_id') {
      parsedValue = parseInt(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // Clear error for this field
    if (formError[name]) {
      setFormError(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !shop) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isEditMode && product) {
        // Update existing product
        const updatedProduct = await updateProduct(product.id, formData as ProductUpdate);
        
        // Update products list
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setProduct(updatedProduct);
        alert('Product updated successfully!');
      } else {
        // Create new product
        const newProduct = await createProduct(shop.id, formData as ProductCreate);
        
        // Add to products list
        setProducts(prev => [...prev, newProduct]);
        resetForm();
        setShowProductForm(false);
        alert('Product created successfully!');
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.detail || 'Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirmation = (productId: number) => {
    setProductToDelete(productId);
  };

  const handleDeleteCancel = () => {
    setProductToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete === null) return;
    
    const productId = productToDelete;
    setProductToDelete(null);
    
    try {
      setIsDeleting(true);
      await deleteProduct(productId);
      
      // Remove from products list
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      if (isEditMode && product && product.id === productId) {
        // Navigate back to product management if we were editing this product
        navigate('/product-management');
      }
      
      // Use a more React-friendly approach instead of alert
      setError('Product deleted successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.detail || 'Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category_id: categories.length > 0 ? categories[0].id : 0,
      stock_quantity: 0,
      is_available: true,
      image_url: '',
    });
    setFormError({});
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!shop) {
    return (
      <div className="product-management-page">
        <div className="no-shop-message">
          <h2>You need to create a shop first</h2>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/shop-management')}
          >
            Create Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management-page">
      <div className="page-header">
        <h1>{isEditMode ? 'Edit Product' : 'Product Management'}</h1>
        {!isEditMode && !showProductForm && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowProductForm(true)}
          >
            Add New Product
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Delete Confirmation Dialog */}
      {productToDelete !== null && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="confirmation-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showProductForm || isEditMode ? (
        <div className="product-form-container">
          <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label htmlFor="name">Product Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={formError.name ? 'error' : ''}
              />
              {formError.name && <div className="field-error">{formError.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price ($)*</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={formError.price ? 'error' : ''}
                />
                {formError.price && <div className="field-error">{formError.price}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="category_id">Category*</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className={formError.category_id ? 'error' : ''}
                >
                  <option value={0}>Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formError.category_id && <div className="field-error">{formError.category_id}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock_quantity">Stock Quantity*</label>
                <input
                  type="number"
                  id="stock_quantity"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  min="0"
                  className={formError.stock_quantity ? 'error' : ''}
                />
                {formError.stock_quantity && <div className="field-error">{formError.stock_quantity}</div>}
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available as boolean}
                    onChange={handleInputChange}
                  />
                  Available for purchase
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
              />
              {formData.image_url && (
                <div className="image-preview">
                  <img src={formData.image_url as string} alt="Product preview" />
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Product' : 'Add Product')}
              </button>
              
              {isEditMode ? (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleDeleteConfirmation(parseInt(productId!))}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Product'}
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    resetForm();
                    setShowProductForm(false);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="shop-info">
            <h2>Products for: {shop.name}</h2>
            <p>Manage your product inventory below</p>
          </div>
          
          {products.length === 0 ? (
            <div className="no-products-message">
              <p>You don't have any products yet.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowProductForm(true)}
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <div className="placeholder-image">📦</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <div className="product-stock">
                      <span className={`stock-status ${product.is_available ? 'in-stock' : 'out-of-stock'}`}>
                        {product.is_available ? 'Available' : 'Not Available'}
                      </span>
                      <span className="stock-quantity">{product.stock_quantity} in stock</span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => navigate(`/product-management/${product.id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteConfirmation(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductManagementPage;