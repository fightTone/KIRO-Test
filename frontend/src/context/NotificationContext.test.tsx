import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import orderService from '../services/orderService';

// Mock dependencies
jest.mock('./AuthContext');
jest.mock('../services/orderService');

// Test component that uses the notification context
const TestComponent = () => {
  const { showNotification, showApiError } = useNotification();
  
  return (
    <div>
      <button onClick={() => showNotification('Test notification', 'success')}>
        Show Success
      </button>
      <button onClick={() => showNotification('Test notification', 'error')}>
        Show Error
      </button>
      <button onClick={() => showApiError(new Error('API Error'))}>
        Show API Error
      </button>
    </div>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock auth context
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    
    // Mock order service
    (orderService.getOrders as jest.Mock).mockResolvedValue([]);
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders children correctly', () => {
    render(
      <NotificationProvider>
        <div data-testid="child">Test Child</div>
      </NotificationProvider>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('shows notification when showNotification is called', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Click button to show notification
    act(() => {
      screen.getByText('Show Success').click();
    });
    
    // Check if notification is displayed
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  test('removes notification after timeout', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Click button to show notification
    act(() => {
      screen.getByText('Show Success').click();
    });
    
    // Check if notification is displayed
    expect(screen.getByText('Test notification')).toBeInTheDocument();
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Check if notification is removed
    await waitFor(() => {
      expect(screen.queryByText('Test notification')).not.toBeInTheDocument();
    });
  });

  test('shows API error notification', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Click button to show API error
    act(() => {
      screen.getByText('Show API Error').click();
    });
    
    // Check if error notification is displayed
    // The extractApiError function would normally parse the error, but in this test
    // we're just checking if any notification appears
    expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
  });

  test('checks for new orders for shop owners', async () => {
    // Mock auth context for shop owner
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'shop_owner' },
      isAuthenticated: true,
    });
    
    // Mock order service to return new orders
    const mockOrders = [
      { id: 1, total_amount: 50.0, created_at: new Date().toISOString() }
    ];
    (orderService.getOrders as jest.Mock).mockResolvedValue(mockOrders);
    
    render(
      <NotificationProvider>
        <div>Shop Owner Dashboard</div>
      </NotificationProvider>
    );
    
    // Wait for the effect to run
    await waitFor(() => {
      expect(orderService.getOrders).toHaveBeenCalledWith({ status: 'pending' });
    });
    
    // Check if order notification is displayed
    expect(screen.getByText(/New order #1 received/)).toBeInTheDocument();
  });
});