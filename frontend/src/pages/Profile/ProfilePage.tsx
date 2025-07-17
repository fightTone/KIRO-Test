import React from 'react';
import { Layout } from '../../components';
import { useAuth } from '../../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <h1>My Profile</h1>
      {user && (
        <div>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          {/* Profile management will be implemented in a future task */}
        </div>
      )}
    </Layout>
  );
};

export default ProfilePage;