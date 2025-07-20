import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>
        We're sorry, but the page you are looking for doesn't exist or has been moved.
        Please check the URL or navigate back to the homepage.
      </p>
      <Link to="/" className="btn">Return to Home</Link>
    </div>
  );
};

export default NotFoundPage;