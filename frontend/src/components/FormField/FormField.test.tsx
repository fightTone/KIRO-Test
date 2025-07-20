import React from 'react';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { axe } from 'jest-axe';
import FormField from './FormField';
import { commonValidationRules } from '../../utils/formValidation';

describe('FormField Component', () => {
  const mockOnChange = jest.fn();
  
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  test('renders text input correctly', () => {
    render(
      <FormField
        id="test-input"
        label="Test Input"
        type="text"
        value=""
        onChange={mockOnChange}
        placeholder="Enter text"
        required
      />
    );
    
    // Check if label and input are rendered
    expect(screen.getByLabelText(/Test Input/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    
    // Check if required indicator is shown
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('renders textarea correctly', () => {
    render(
      <FormField
        id="test-textarea"
        label="Test Textarea"
        type="textarea"
        value=""
        onChange={mockOnChange}
        rows={5}
      />
    );
    
    // Check if textarea is rendered
    const textarea = screen.getByLabelText(/Test Textarea/);
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  test('renders select dropdown correctly', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];
    
    render(
      <FormField
        id="test-select"
        label="Test Select"
        type="select"
        value=""
        onChange={mockOnChange}
        options={options}
      />
    );
    
    // Check if select is rendered
    const select = screen.getByLabelText(/Test Select/);
    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');
    
    // Check if options are rendered
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  test('calls onChange when input value changes', () => {
    render(
      <FormField
        id="test-input"
        label="Test Input"
        type="text"
        value=""
        onChange={mockOnChange}
      />
    );
    
    // Get the input element
    const input = screen.getByLabelText(/Test Input/);
    
    // Simulate input change
    fireEvent.change(input, { target: { value: 'test value' } });
    
    // Check if onChange was called
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  test('shows validation error on blur', () => {
    render(
      <FormField
        id="test-email"
        label="Email"
        type="email"
        value="invalid-email"
        onChange={mockOnChange}
        validationRules={[commonValidationRules.email()]}
        validateOnBlur
      />
    );
    
    // Get the input element
    const input = screen.getByLabelText(/Email/);
    
    // Trigger blur event
    fireEvent.blur(input);
    
    // Check if error message is displayed
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    
    // Check if input has error class
    expect(input).toHaveClass('form-field-error');
  });

  test('shows validation error on change when validateOnChange is true', () => {
    render(
      <FormField
        id="test-email"
        label="Email"
        type="email"
        value="invalid-email"
        onChange={mockOnChange}
        validationRules={[commonValidationRules.email()]}
        validateOnChange
      />
    );
    
    // Get the input element
    const input = screen.getByLabelText(/Email/);
    
    // First trigger blur to mark as touched
    fireEvent.blur(input);
    
    // Then trigger change
    fireEvent.change(input, { target: { value: 'still-invalid' } });
    
    // Check if error message is displayed
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  test('clears validation error when input becomes valid', () => {
    const { rerender } = render(
      <FormField
        id="test-email"
        label="Email"
        type="email"
        value="invalid-email"
        onChange={mockOnChange}
        validationRules={[commonValidationRules.email()]}
        validateOnChange
      />
    );
    
    // Get the input element
    const input = screen.getByLabelText(/Email/);
    
    // First trigger blur to mark as touched
    fireEvent.blur(input);
    
    // Check if error message is displayed
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    
    // Rerender with valid email
    rerender(
      <FormField
        id="test-email"
        label="Email"
        type="email"
        value="valid@email.com"
        onChange={mockOnChange}
        validationRules={[commonValidationRules.email()]}
        validateOnChange
      />
    );
    
    // Check if error message is no longer displayed
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
  });

  test('should not have accessibility violations', async () => {
    const { container } = render(
      <FormField
        id="test-input"
        label="Test Input"
        type="text"
        value=""
        onChange={mockOnChange}
        required
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});