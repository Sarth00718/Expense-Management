import React from 'react';
import UserList from '../components/users/UserList';

const UsersPage = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          👥 Users
        </h1>
        <p className="text-text-secondary">
          Manage users, roles, and permissions
        </p>
      </div>
      <UserList />
    </div>
  );
};

export default UsersPage;
