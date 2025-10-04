import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import UserCard from './UserCard';
import UserForm from './UserForm';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    search: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getUsers(filters);
      setUsers(response.data.data);
      
      // Get managers for the dropdown
      const managersResponse = await userService.getUsers({ role: 'manager' });
      const adminsResponse = await userService.getUsers({ role: 'admin' });
      setManagers([...managersResponse.data.data, ...adminsResponse.data.data]);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      setFormLoading(true);
      await userService.createUser(userData);
      setShowModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      setFormLoading(true);
      await userService.updateUser(selectedUser._id, userData);
      setShowModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await userService.deleteUser(user._id);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete user');
    }
  };

  const handleChangeRole = async (newRole) => {
    try {
      setFormLoading(true);
      await userService.updateUserRole(selectedUser._id, newRole);
      setShowRoleModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to change role');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-accent text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">User Management</h1>
          <p className="text-text-secondary">Manage your team members and their roles</p>
        </div>
        {currentUser.role === 'admin' && (
          <Button onClick={() => setShowModal(true)}>
            + Add User
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error/20 border border-error rounded-lg text-error">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 bg-primary border-2 border-secondary rounded-lg text-text-primary 
                placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">
              Filter by Role
            </label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-primary border-2 border-secondary rounded-lg text-text-primary 
                focus:outline-none focus:border-accent transition-all duration-300"
            >
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Card>

      {/* User Grid */}
      {users.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">No users found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <UserCard
              key={user._id}
              user={user}
              onEdit={openEditModal}
              onDelete={handleDeleteUser}
              onChangeRole={openRoleModal}
            />
          ))}
        </div>
      )}

      {/* Create/Edit User Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={selectedUser ? 'Edit User' : 'Create New User'}
        >
          <UserForm
            user={selectedUser}
            managers={managers}
            onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
            onCancel={closeModal}
            loading={formLoading}
          />
        </Modal>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <Modal
          isOpen={showRoleModal}
          onClose={closeModal}
          title="Change User Role"
        >
          <div className="space-y-4">
            <p className="text-text-secondary">
              Change role for <span className="text-text-primary font-semibold">
                {selectedUser.firstName} {selectedUser.lastName}
              </span>
            </p>
            <p className="text-sm text-text-secondary">
              Current role: <span className="text-accent font-semibold uppercase">{selectedUser.role}</span>
            </p>
            <div className="space-y-2">
              {['employee', 'manager', 'admin'].map(role => (
                <button
                  key={role}
                  onClick={() => handleChangeRole(role)}
                  disabled={formLoading || role === selectedUser.role}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300
                    ${role === selectedUser.role 
                      ? 'bg-secondary text-text-secondary cursor-not-allowed' 
                      : 'bg-accent/20 text-accent hover:bg-accent hover:text-primary'
                    }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
            <Button
              variant="secondary"
              onClick={closeModal}
              fullWidth
              disabled={formLoading}
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserList;
