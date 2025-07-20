import React from 'react';
import { render, screen } from './utils/test-utils';
import { axe } from 'jest-axe';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    // Check for the header which should always be present
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });

  test('should not have accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
