import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { axe } from 'jest-axe';
import Header from './Header';
import { useAuth } from '../../context';

// Mock the auth context
jest.mock('../../context', () => ({
  useAuth: jest.fn(),
}));

describe('Header Component', () => {
  const mockLogout = jest.fn();
  
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  test('renders unauthenticated state correctly', () => {
    // Mock the auth context for unauthenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
    });

    render(<Header />);
    
    // Check for unauthenticated navigation items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Shops')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    
    // Should not show authenticated-only items
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('renders authenticated customer state correctly', () => {
    // Mock the auth context for authenticated customer
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'customer' },
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Header />);
    
    // Check for authenticated customer navigation items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('My Orders')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Should not show shop owner items
    expect(screen.queryByText('My Shop')).not.toBeInTheDocument();
  });

  test('renders authenticated shop owner state correctly', () => {
    // Mock the auth context for authenticated shop owner
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'shop_owner' },
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Header />);
    
    // Check for authenticated shop owner navigation items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('My Shop')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Should not show customer-only items
    expect(screen.queryByText('My Orders')).not.toBeInTheDocument();
  });

  test('toggles mobile menu when button is clicked', () => {
    // Mock the auth context
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
    });

    render(<Header />);
    
    // Get the mobile menu toggle button
    const menuToggle = screen.getByLabelText('Toggle navigation menu');
    
    // Click the toggle button
    fireEvent.click(menuToggle);
    
    // Check if the nav element has the mobile-menu-open class
    const nav = document.querySelector('.nav');
    expect(nav).toHaveClass('mobile-menu-open');
    
    // Click again to close
    fireEvent.click(menuToggle);
    
    // Check if the class is removed
    expect(nav).not.toHaveClass('mobile-menu-open');
  });

  test('calls logout when logout button is clicked', () => {
    // Mock the auth context for authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'customer' },
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Header />);
    
    // Get the logout button
    const logoutButton = screen.getByText('Logout');
    
    // Click the logout button
    fireEvent.click(logoutButton);
    
    // Check if logout was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('should not have accessibility violations', async () => {
    // Mock the auth context
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
    });

    const { container } = render(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});