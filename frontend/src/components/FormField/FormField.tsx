import React, { useState, useEffect } from 'react';
import { ValidationRule, validateField } from '../../utils/formValidation';
import './FormField.css';

interface FormFieldProps {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  validationRules?: ValidationRule[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  validationRules = [],
  placeholder = '',
  required = false,
  disabled = false,
  options = [],
  rows = 3,
  validateOnBlur = true,
  validateOnChange = false,
  className = '',
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Validate on value change if validateOnChange is true
  useEffect(() => {
    if (touched && validateOnChange && validationRules.length > 0) {
      const { isValid, errorMessage } = validateField(value, validationRules);
      setError(isValid ? '' : errorMessage);
    }
  }, [value, touched, validateOnChange, validationRules]);

  const handleBlur = () => {
    setTouched(true);
    if (validateOnBlur && validationRules.length > 0) {
      const { isValid, errorMessage } = validateField(value, validationRules);
      setError(isValid ? '' : errorMessage);
    }
  };

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={`form-textarea ${error ? 'form-field-error' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        );
      case 'select':
        return (
          <select
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            className={`form-select ${error ? 'form-field-error' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <option value="" disabled>
              {placeholder || 'Select an option'}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`form-input ${error ? 'form-field-error' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        );
    }
  };

  return (
    <div className={`form-field ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      {renderField()}
      {error && (
        <div id={`${id}-error`} className="form-error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;