import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  fullPage = false,
  message = 'Loading...'
}) => {
  const containerClass = fullPage ? 'spinner-fullpage' : 'spinner-container';
  
  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className={`spinner ${size}`} aria-hidden="true"></div>
      {message && <p className="spinner-message">{message}</p>}
      <span className="sr-only">Loading content, please wait.</span>
    </div>
  );
};

export default LoadingSpinner;