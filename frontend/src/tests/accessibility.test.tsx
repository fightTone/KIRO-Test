import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { NotificationProvider } from '../context/NotificationContext';

// Import key components for testing
import Header from '../components/Layout/Header';
import FormField from '../components/FormField/FormField';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import Notification from '../components/Notification/Notification';

// Wrap components with necessary providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            {component}
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Accessibility Tests', () => {
  it('App should not have accessibility violations', async () => {
    const { container } = renderWithProviders(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Header should not have accessibility violations', async () => {
    const { container } = renderWithProviders(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('FormField should not have accessibility violations', async () => {
    const { container } = render(
      <FormField
        id="test-field"
        label="Test Field"
        type="text"
        value=""
        onChange={() => {}}
        required
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('LoadingSpinner should not have accessibility violations', async () => {
    const { container } = render(<LoadingSpinner />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ErrorBoundary should not have accessibility violations', async () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Notification should not have accessibility violations', async () => {
    const { container } = render(
      <Notification
        message="Test notification"
        type="info"
        onClose={() => {}}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Form with validation errors should not have accessibility violations', async () => {
    const { container } = render(
      <form>
        <FormField
          id="test-email"
          label="Email"
          type="email"
          value="invalid-email"
          onChange={() => {}}
          validationRules={[{
            validator: () => false,
            message: 'Invalid email format'
          }]}
          validateOnBlur
        />
        <button type="submit">Submit</button>
      </form>
    );
    
    // Trigger validation error
    const input = container.querySelector('input');
    if (input) {
      input.dispatchEvent(new Event('blur'));
    }
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});