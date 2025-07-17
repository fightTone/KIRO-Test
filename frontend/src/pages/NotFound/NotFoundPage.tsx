import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components';

const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <div className="not-found">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="btn">Return to Home</Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;