import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import ApprovalRulesForm from './ApprovalRulesForm';
import ApprovalRulesList from './ApprovalRulesList';
import Button from '../common/Button';
import {
  getApprovalRules,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule
} from '../../services/approvalService';
import { getUsers } from '../../services/userService';

const ApprovalRulesManager = () => {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [rulesResponse, usersResponse] = await Promise.all([
        getApprovalRules(),
        getUsers()
      ]);
      
      setRules(rulesResponse.data || []);
      setUsers(usersResponse.data?.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error?.message || 'Failed to load approval rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedRule(null);
    setFormModalOpen(true);
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      if (selectedRule) {
        await updateApprovalRule(selectedRule._id, formData);
        setSuccessMessage('Approval rule updated successfully!');
      } else {
        await createApprovalRule(formData);
        setSuccessMessage('Approval rule created successfully!');
      }

      setFormModalOpen(false);
      setSelectedRule(null);
      await fetchData();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving approval rule:', err);
      setError(err.response?.data?.error?.message || 'Failed to save approval rule');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setFormModalOpen(false);
    setSelectedRule(null);
  };

  const handleDeleteClick = (rule) => {
    setRuleToDelete(rule);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      setError(null);

      await deleteApprovalRule(ruleToDelete._id);
      setSuccessMessage('Approval rule deleted successfully!');

      setDeleteModalOpen(false);
      setRuleToDelete(null);
      await fetchData();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting approval rule:', err);
      setError(err.response?.data?.error?.message || 'Failed to delete approval rule');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      setError(null);
      
      await updateApprovalRule(rule._id, {
        ...rule,
        isActive: !rule.isActive,
        conditions: rule.conditions
      });
      
      setSuccessMessage(`Rule ${!rule.isActive ? 'activated' : 'deactivated'} successfully!`);
      await fetchData();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error toggling rule status:', err);
      setError(err.response?.data?.error?.message || 'Failed to update rule status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Approval Rules</h2>
          <p className="text-text-secondary">
            Configure automated approval workflows for expense management
          </p>
        </div>
        
        <Button onClick={handleCreateNew} variant="primary">
          + Create New Rule
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-success/10 border-2 border-success text-success px-4 py-3 rounded-lg animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border-2 border-error text-error px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-accent/5 border-2 border-accent/30 rounded-lg p-4">
        <h3 className="text-accent font-semibold mb-2">💡 How Approval Rules Work</h3>
        <ul className="text-text-secondary text-sm space-y-1">
          <li>• <strong>Percentage-based:</strong> Auto-approve when a percentage of approvers approve</li>
          <li>• <strong>Specific Approver:</strong> Auto-approve when a designated person approves</li>
          <li>• <strong>Hybrid:</strong> Requires both percentage threshold AND specific approver</li>
          <li>• Rules are evaluated in priority order (higher priority first)</li>
        </ul>
      </div>

      {/* Rules List */}
      <ApprovalRulesList
        rules={rules}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onToggleActive={handleToggleActive}
      />

      {/* Form Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={handleFormCancel}
        title={selectedRule ? 'Edit Approval Rule' : 'Create Approval Rule'}
      >
        <ApprovalRulesForm
          rule={selectedRule}
          users={users}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRuleToDelete(null);
        }}
        title="Delete Approval Rule"
      >
        <div className="space-y-6">
          <p className="text-text-primary">
            Are you sure you want to delete the rule <strong>"{ruleToDelete?.name}"</strong>?
          </p>
          
          <div className="bg-warning/10 border-2 border-warning rounded-lg p-4">
            <p className="text-warning text-sm">
              ⚠️ This action cannot be undone. Deleting this rule may affect pending expense approvals.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setRuleToDelete(null);
              }}
              disabled={deleteLoading}
              className="flex-1 px-6 py-3 bg-secondary border-2 border-text-secondary text-text-secondary rounded-lg
                hover:bg-text-secondary hover:text-primary transition-all duration-300 font-semibold
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="flex-1 px-6 py-3 bg-error text-white rounded-lg
                hover:shadow-[0_0_20px_rgba(255,51,102,0.5)] transition-all duration-300 font-semibold
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Rule'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApprovalRulesManager;
