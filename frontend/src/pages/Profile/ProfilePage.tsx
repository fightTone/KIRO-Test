import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import userService from '../../services/userService';
import './ProfilePage.css';

interface ProfileFormData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'dashboard'>('profile');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: '',
    address: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Dashboard stats (for shop owners)
  const [shopStats, setShopStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0
  });
  
  // Load user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      
      // If user is a shop owner, fetch shop stats
      if (user.role === 'shop_owner') {
        fetchShopStats();
      }
    }
  }, [user]);
  
  const fetchShopStats = async () => {
    try {
      const stats = await userService.getShopOwnerStats();
      setShopStats(stats);
    } catch (error) {
      console.error('Error fetching shop stats:', error);
    }
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await userService.updateProfile(profileForm);
      showNotification('Profile updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showNotification(
        error.response?.data?.detail || 'Failed to update profile',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await userService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      
      showNotification('Password updated successfully', 'success');
      
      // Reset form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      showNotification(
        error.response?.data?.detail || 'Failed to update password',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    
    try {
      await userService.deleteAccount();
      showNotification('Account deleted successfully', 'success');
      logout(); // Log out the user after account deletion
    } catch (error: any) {
      console.error('Error deleting account:', error);
      showNotification(
        error.response?.data?.detail || 'Failed to delete account',
        'error'
      );
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };
  
  if (!user) {
    return <div className="profile-container">Loading profile...</div>;
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button 
          className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        {user.role === 'shop_owner' && (
          <button 
            className={`profile-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        )}
      </div>
      
      {activeTab === 'profile' && (
        <div>
          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                value={user.username} 
                disabled 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={profileForm.email} 
                onChange={handleProfileChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input 
                type="text" 
                id="first_name" 
                name="first_name"
                value={profileForm.first_name} 
                onChange={handleProfileChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input 
                type="text" 
                id="last_name" 
                name="last_name"
                value={profileForm.last_name} 
                onChange={handleProfileChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone"
                value={profileForm.phone} 
                onChange={handleProfileChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input 
                type="text" 
                id="address" 
                name="address"
                value={profileForm.address} 
                onChange={handleProfileChange}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
          
          <div className="danger-zone">
            <h3>Danger Zone</h3>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button 
              className="btn btn-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'password' && (
        <div>
          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="current_password">Current Password</label>
              <input 
                type="password" 
                id="current_password" 
                name="current_password"
                value={passwordForm.current_password} 
                onChange={handlePasswordChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="new_password">New Password</label>
              <input 
                type="password" 
                id="new_password" 
                name="new_password"
                value={passwordForm.new_password} 
                onChange={handlePasswordChange}
                required 
                minLength={8}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirm_password">Confirm New Password</label>
              <input 
                type="password" 
                id="confirm_password" 
                name="confirm_password"
                value={passwordForm.confirm_password} 
                onChange={handlePasswordChange}
                required 
                minLength={8}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {activeTab === 'dashboard' && user.role === 'shop_owner' && (
        <div>
          <div className="dashboard-section">
            <h3>Shop Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Orders</h4>
                <div className="value">{shopStats.totalOrders}</div>
              </div>
              <div className="stat-card">
                <h4>Pending Orders</h4>
                <div className="value">{shopStats.pendingOrders}</div>
              </div>
              <div className="stat-card">
                <h4>Total Products</h4>
                <div className="value">{shopStats.totalProducts}</div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-section">
            <h3>Quick Links</h3>
            <div className="form-actions">
              <a href="/orders" className="btn btn-secondary">View Orders</a>
              <a href="/my-shop" className="btn btn-secondary">Manage Shop</a>
              <a href="/product-management" className="btn btn-secondary">Manage Products</a>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
              <p>All your data will be permanently removed.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;