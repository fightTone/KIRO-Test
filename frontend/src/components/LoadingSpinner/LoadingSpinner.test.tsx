import React from 'react';
import { render, screen } from '../../utils/test-utils';
import { axe } from 'jest-axe';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  test('renders with default props', () => {
    render(<LoadingSpinner />);
    
    // Check if spinner is rendered
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Check default classes
    const spinnerElement = screen.getByRole('status');
    expect(spinnerElement).toHaveClass('spinner-container');
    expect(spinnerElement.querySelector('.spinner')).toHaveClass('medium');
  });

  test('renders with custom size', () => {
    render(<LoadingSpinner size="large" />);
    
    // Check if spinner has the correct size class
    const spinnerElement = screen.getByRole('status');
    expect(spinnerElement.querySelector('.spinner')).toHaveClass('large');
  });

  test('renders as fullPage spinner', () => {
    render(<LoadingSpinner fullPage />);
    
    // Check if spinner has the fullPage class
    const spinnerElement = screen.getByRole('status');
    expect(spinnerElement).toHaveClass('spinner-fullpage');
  });

  test('renders with custom message', () => {
    render(<LoadingSpinner message="Custom loading message" />);
    
    // Check if custom message is displayed
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  test('should not have accessibility violations', async () => {
    const { container } = render(<LoadingSpinner />);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});