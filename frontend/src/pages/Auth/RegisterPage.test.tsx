import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { axe } from 'jest-axe';
import RegisterPage from './RegisterPage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

// Mock the hooks
jest.mock('../../context/AuthContext');
jest.mock('../../context/NotificationContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('RegisterPage Component', () => {
  const mockRegister = jest.fn();
  const mockShowApiError = jest.fn();
  
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
    
    // Mock the auth context
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
    });
    
    // Mock the notification context
    (useNotification as jest.Mock).mockReturnValue({
      showApiError: mockShowApiError,
    });
  });

  test('renders registration form correctly', () => {
    render(<RegisterPage />);
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test('validates form fields on submit', async () => {
    render(<RegisterPage />);
    
    // Submit the form without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
    
    // Verify register function was not called
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('validates password match', async () => {
    render(<RegisterPage />);
    
    // Fill in form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'DifferentPassword' } });
    
    // Trigger validation by blurring the confirm password field
    fireEvent.blur(screen.getByLabelText(/Confirm Password/i));
    
    // Check if password mismatch error is displayed
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    render(<RegisterPage />);
    
    // Fill in form with valid data
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'User' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    
    // Check if register function was called with correct data
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
        role: 'customer',
        first_name: 'Test',
        last_name: 'User',
        phone: '',
        address: '',
      });
    });
  });

  test('handles registration error', async () => {
    // Mock register to throw an error
    mockRegister.mockRejectedValueOnce(new Error('Registration failed'));
    
    render(<RegisterPage />);
    
    // Fill in form with valid data
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    
    // Check if error handling was called
    await waitFor(() => {
      expect(mockShowApiError).toHaveBeenCalled();
    });
  });

  test('should not have accessibility violations', async () => {
    const { container } = render(<RegisterPage />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});