// Form validation utility functions

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation (simple format check)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

// Required field validation
export const isRequired = (value: string): boolean => {
  return value.trim() !== '';
};

// Min length validation
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

// Max length validation
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

// Number validation
export const isNumber = (value: string): boolean => {
  return !isNaN(Number(value));
};

// Positive number validation
export const isPositiveNumber = (value: string): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Form field validation with error message
export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

// Validation rules for form fields
export interface ValidationRule {
  validator: (value: string, ...args: any[]) => boolean;
  message: string;
  args?: any[];
}

// Validate a field against multiple rules
export const validateField = (value: string, rules: ValidationRule[]): ValidationResult => {
  for (const rule of rules) {
    const isValid = rule.validator(value, ...(rule.args || []));
    if (!isValid) {
      return {
        isValid: false,
        errorMessage: rule.message
      };
    }
  }
  
  return {
    isValid: true,
    errorMessage: ''
  };
};

// Common validation rules
export const commonValidationRules = {
  required: (fieldName: string): ValidationRule => ({
    validator: isRequired,
    message: `${fieldName} is required`
  }),
  email: (): ValidationRule => ({
    validator: isValidEmail,
    message: 'Please enter a valid email address'
  }),
  password: (): ValidationRule => ({
    validator: isValidPassword,
    message: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers'
  }),
  phone: (): ValidationRule => ({
    validator: isValidPhone,
    message: 'Please enter a valid phone number'
  }),
  minLength: (fieldName: string, min: number): ValidationRule => ({
    validator: minLength,
    message: `${fieldName} must be at least ${min} characters`,
    args: [min]
  }),
  maxLength: (fieldName: string, max: number): ValidationRule => ({
    validator: maxLength,
    message: `${fieldName} cannot exceed ${max} characters`,
    args: [max]
  }),
  positiveNumber: (fieldName: string): ValidationRule => ({
    validator: isPositiveNumber,
    message: `${fieldName} must be a positive number`
  }),
  url: (): ValidationRule => ({
    validator: isValidUrl,
    message: 'Please enter a valid URL'
  })
};