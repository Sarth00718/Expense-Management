import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ApprovalQueue from '../components/approvals/ApprovalQueue';
import ApprovalRulesManager from '../components/approvals/ApprovalRulesManager';

const ApprovalsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('queue');

  // Only admins can see the Rules tab
  const showRulesTab = user?.role === 'admin';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          ✅ Approvals
        </h1>
        <p className="text-text-secondary">
          Review and approve pending expense requests
        </p>
      </div>

      {/* Tabs */}
      {showRulesTab && (
        <div className="mb-6 border-b-2 border-secondary">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                activeTab === 'queue'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Approval Queue
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                activeTab === 'rules'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Rules
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'queue' && <ApprovalQueue />}
      {activeTab === 'rules' && showRulesTab && <ApprovalRulesManager />}
    </div>
  );
};

export default ApprovalsPage;
