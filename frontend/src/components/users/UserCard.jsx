import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserCard = ({ user, onEdit, onDelete, onChangeRole }) => {
  const { user: currentUser } = useAuth();

  const roleColors = {
    admin: 'bg-accent-secondary text-white',
    manager: 'bg-accent text-primary',
    employee: 'bg-secondary text-text-secondary'
  };

  const canEdit = currentUser.role === 'admin' || 
    (currentUser.role === 'manager' && user.managerId?.toString() === currentUser._id?.toString());
  
  const canDelete = currentUser.role === 'admin' && user._id !== currentUser._id;
  const canChangeRole = currentUser.role === 'admin' && user._id !== currentUser._id;

  return (
    <div className="bg-gradient-to-br from-secondary to-secondary/80 border border-accent/30 rounded-xl p-6 hover:border-accent/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-text-primary mb-1">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-text-secondary text-sm">{user.email}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${roleColors[user.role]}`}>
          {user.role}
        </span>
      </div>

      {user.managerId && (
        <div className="mb-4 p-3 bg-primary/50 rounded-lg">
          <p className="text-xs text-text-secondary mb-1">Reports to:</p>
          <p className="text-sm text-text-primary">
            {user.managerId.firstName} {user.managerId.lastName}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-text-secondary mb-4">
        <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
        <span className={user.isActive ? 'text-success' : 'text-error'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {(canEdit || canDelete || canChangeRole) && (
        <div className="flex gap-2 pt-4 border-t border-accent/20">
          {canEdit && (
            <button
              onClick={() => onEdit(user)}
              className="flex-1 px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent hover:text-primary transition-all duration-300 text-sm font-medium"
            >
              Edit
            </button>
          )}
          {canChangeRole && (
            <button
              onClick={() => onChangeRole(user)}
              className="flex-1 px-4 py-2 bg-accent-secondary/20 text-accent-secondary rounded-lg hover:bg-accent-secondary hover:text-white transition-all duration-300 text-sm font-medium"
            >
              Change Role
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(user)}
              className="px-4 py-2 bg-error/20 text-error rounded-lg hover:bg-error hover:text-white transition-all duration-300 text-sm font-medium"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCard;
