import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import ErrorBoundary from './ErrorBoundary';

// Create a component that throws an error
const ErrorThrowingComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal component content</div>;
};

// Suppress console.error for cleaner test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary Component', () => {
  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders error UI when child component throws', () => {
    // We need to mock the console.error to prevent the expected error from being logged
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check if error message is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We\'re sorry, but there was an error loading this part of the page.')).toBeInTheDocument();
    
    // Clean up
    spy.mockRestore();
  });

  test('renders custom fallback UI when provided', () => {
    // We need to mock the console.error to prevent the expected error from being logged
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(
      <ErrorBoundary fallback={<div>Custom Error UI</div>}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check if custom fallback is displayed
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    
    // Clean up
    spy.mockRestore();
  });

  test('resets error state when "Try again" button is clicked', () => {
    // We need to mock the console.error to prevent the expected error from being logged
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check if error message is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click the "Try again" button
    fireEvent.click(screen.getByText('Try again'));
    
    // Rerender with a non-throwing component
    rerender(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // Check if normal content is displayed
    expect(screen.getByText('Normal component content')).toBeInTheDocument();
    
    // Clean up
    spy.mockRestore();
  });

  test('should not have accessibility violations when displaying error', async () => {
    // We need to mock the console.error to prevent the expected error from being logged
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const { container } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Clean up
    spy.mockRestore();
  });
});