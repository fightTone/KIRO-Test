# Utility Functions

This directory contains utility functions used throughout the application.

## Form Validation

The `formValidation.ts` file provides utilities for validating form inputs with user-friendly error messages.

### Basic Validation Functions

```typescript
// Check if email is valid
isValidEmail(email: string): boolean

// Check if password meets requirements (8+ chars, uppercase, lowercase, number)
isValidPassword(password: string): boolean

// Check if phone number is valid
isValidPhone(phone: string): boolean

// Check if field is not empty
isRequired(value: string): boolean

// Check if value meets minimum length
minLength(value: string, min: number): boolean

// Check if value doesn't exceed maximum length
maxLength(value: string, max: number): boolean

// Check if value is a number
isNumber(value: string): boolean

// Check if value is a positive number
isPositiveNumber(value: string): boolean

// Check if value is a valid URL
isValidUrl(url: string): boolean
```

### Validation Rules

The `commonValidationRules` object provides pre-configured validation rules that can be used with the `FormField` component:

```typescript
import { commonValidationRules } from '../utils/formValidation';

// Example usage
const emailRules = [
  commonValidationRules.required('Email'),
  commonValidationRules.email()
];

const passwordRules = [
  commonValidationRules.required('Password'),
  commonValidationRules.password()
];

const nameRules = [
  commonValidationRules.required('Name'),
  commonValidationRules.minLength('Name', 2),
  commonValidationRules.maxLength('Name', 50)
];

const priceRules = [
  commonValidationRules.required('Price'),
  commonValidationRules.positiveNumber('Price')
];
```

### Custom Validation Rules

You can also create custom validation rules:

```typescript
import { ValidationRule } from '../utils/formValidation';

// Custom validation rule for password confirmation
const confirmPasswordRule: ValidationRule = {
  validator: (value: string) => value === password,
  message: 'Passwords do not match'
};

// Custom validation rule for username availability
const usernameAvailableRule: ValidationRule = {
  validator: async (value: string) => {
    const response = await checkUsernameAvailability(value);
    return response.available;
  },
  message: 'Username is already taken'
};
```