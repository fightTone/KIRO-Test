# Error Handling Components

This directory contains components for handling errors and loading states in the application.

## ErrorBoundary

The `ErrorBoundary` component is a class component that catches JavaScript errors in its child component tree and displays a fallback UI instead of crashing the entire application.

### Usage

```jsx
import { ErrorBoundary } from '../../components';

// Wrap components that might throw errors
<ErrorBoundary>
  <ComponentThatMightThrowError />
</ErrorBoundary>

// With custom fallback UI
<ErrorBoundary fallback={<CustomErrorComponent />}>
  <ComponentThatMightThrowError />
</ErrorBoundary>
```

## LoadingSpinner

The `LoadingSpinner` component displays a loading indicator when content is being loaded.

### Usage

```jsx
import { LoadingSpinner } from '../../components';

// Basic usage
<LoadingSpinner />

// With custom size
<LoadingSpinner size="small" />
<LoadingSpinner size="medium" />
<LoadingSpinner size="large" />

// Full page overlay
<LoadingSpinner fullPage={true} />

// With custom message
<LoadingSpinner message="Loading products..." />
```

## FormField

The `FormField` component provides a standardized form field with built-in validation.

### Usage

```jsx
import { FormField } from '../../components';
import { commonValidationRules } from '../../utils/formValidation';

// Text input with validation
<FormField
  id="username"
  label="Username"
  type="text"
  value={username}
  onChange={handleChange}
  validationRules={[
    commonValidationRules.required('Username'),
    commonValidationRules.minLength('Username', 3)
  ]}
  required
/>

// Select input
<FormField
  id="role"
  label="Role"
  type="select"
  value={role}
  onChange={handleChange}
  options={[
    { value: 'customer', label: 'Customer' },
    { value: 'shop_owner', label: 'Shop Owner' }
  ]}
  required
/>

// Textarea
<FormField
  id="description"
  label="Description"
  type="textarea"
  value={description}
  onChange={handleChange}
  rows={5}
/>
```