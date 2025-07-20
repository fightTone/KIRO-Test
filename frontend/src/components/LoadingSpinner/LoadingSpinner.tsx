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
  const spinnerContent = (
    <>
      <div className={`spinner ${size}`}></div>
      {message && <p className="spinner-message">{message}</p>}
    </>
  );

  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="spinner-container">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;