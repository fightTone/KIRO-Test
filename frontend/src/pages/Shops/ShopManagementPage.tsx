import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shop, Category } from '../../types';
import { getMyShop, createShop, updateShop, ShopCreate, ShopUpdate } from '../../services/shopManagementService';
import { getCategories } from '../../services/shopService';
import './ShopManagementPage.css';

const ShopManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: 0,
    address: '',
    phone: '',
    email: '',
    image_url: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Try to load existing shop
        const shopData = await getMyShop();
        if (shopData) {
          setShop(shopData);
          setFormData({
            name: shopData.name,
            description: shopData.description || '',
            category_id: shopData.category_id,
            address: shopData.address,
            phone: shopData.phone || '',
            email: shopData.email || '',
            image_url: shopData.image_url || '',
          });
        } else if (categoriesData.length > 0) {
          // Set default category if creating new shop
          setFormData(prev => ({
            ...prev,
            category_id: categoriesData[0].id
          }));
        }
      } catch (err) {
        console.error('Error loading shop data:', err);
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
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Shop name is required';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (formData.category_id <= 0) {
      errors.category_id = 'Please select a category';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category_id' ? parseInt(value) : value
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
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (shop) {
        // Update existing shop
        const updatedShop = await updateShop(shop.id, formData as ShopUpdate);
        setShop(updatedShop);
        alert('Shop updated successfully!');
      } else {
        // Create new shop
        const newShop = await createShop(formData as ShopCreate);
        setShop(newShop);
        alert('Shop created successfully!');
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error saving shop:', err);
      setError(err.response?.data?.detail || 'Failed to save shop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="shop-management-page">
      <h1>{shop ? 'Edit Your Shop' : 'Create Your Shop'}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="shop-form">
        <div className="form-group">
          <label htmlFor="name">Shop Name*</label>
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
        
        <div className="form-group">
          <label htmlFor="address">Address*</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={formError.address ? 'error' : ''}
          />
          {formError.address && <div className="field-error">{formError.address}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={formError.email ? 'error' : ''}
          />
          {formError.email && <div className="field-error">{formError.email}</div>}
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
              <img src={formData.image_url} alt="Shop preview" />
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (shop ? 'Update Shop' : 'Create Shop')}
          </button>
          
          {shop && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/my-shop')}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ShopManagementPage;