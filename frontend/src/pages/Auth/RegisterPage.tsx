import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { FormField, LoadingSpinner } from '../../components';
import { commonValidationRules, ValidationRule } from '../../utils/formValidation';
import { UserRegistration } from '../../types';

interface FormData extends UserRegistration {
  confirmPassword: string;
}

interface FormErrors {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
  });
  
  const { register, isAuthenticated } = useAuth();
  const { showApiError } = useNotification();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      first_name: '',
      last_name: '',
      phone: '',
      address: '',
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/');
    } catch (err: any) {
      // Use the new API error handling
      showApiError(err, 'Registration failed. Please try again.');
      setError(''); // Clear the old error since we're using notifications now
    } finally {
      setIsLoading(false);
    }
  };

  // Define validation rules for each field
  const emailRules = [
    commonValidationRules.required('Email'),
    commonValidationRules.email()
  ];
  
  const usernameRules = [
    commonValidationRules.required('Username'),
    commonValidationRules.minLength('Username', 3)
  ];
  
  const passwordRules = [
    commonValidationRules.required('Password'),
    commonValidationRules.password()
  ];
  
  // Custom validation rule for password confirmation
  const confirmPasswordRule: ValidationRule = {
    validator: (value: string) => value === formData.password,
    message: 'Passwords do not match'
  };
  
  const phoneRules = [
    commonValidationRules.phone()
  ];

  return (
    <div className="auth-page">
      <h1>Register</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <FormField
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          validationRules={emailRules}
          required
        />
        
        <FormField
          id="username"
          label="Username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          validationRules={usernameRules}
          required
        />
        
        <FormField
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          validationRules={passwordRules}
          required
        />
        
        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          validationRules={[confirmPasswordRule]}
          required
        />
        
        <FormField
          id="role"
          label="Role"
          type="select"
          value={formData.role}
          onChange={handleChange}
          options={[
            { value: 'customer', label: 'Customer' },
            { value: 'shop_owner', label: 'Shop Owner' }
          ]}
          required
        />
        
        <FormField
          id="first_name"
          label="First Name"
          type="text"
          value={formData.first_name}
          onChange={handleChange}
        />
        
        <FormField
          id="last_name"
          label="Last Name"
          type="text"
          value={formData.last_name}
          onChange={handleChange}
        />
        
        <FormField
          id="phone"
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          validationRules={phoneRules}
        />
        
        <FormField
          id="address"
          label="Address"
          type="text"
          value={formData.address}
          onChange={handleChange}
        />
        
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? <LoadingSpinner size="small" /> : 'Register'}
        </button>
      </form>
      
      <p className="auth-link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;