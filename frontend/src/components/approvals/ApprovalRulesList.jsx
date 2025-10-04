import React from 'react';

const ApprovalRulesList = ({ rules, onEdit, onDelete, onToggleActive }) => {
  const getRuleTypeLabel = (type) => {
    switch (type) {
      case 'percentage':
        return '📊 Percentage-based';
      case 'specific_approver':
        return '👤 Specific Approver';
      case 'hybrid':
        return '🔀 Hybrid';
      default:
        return type;
    }
  };

  const getRuleDescription = (rule) => {
    const parts = [];
    
    if (rule.type === 'percentage' || rule.type === 'hybrid') {
      parts.push(`${rule.conditions.percentageThreshold}% approval threshold`);
    }
    
    if (rule.type === 'specific_approver' || rule.type === 'hybrid') {
      const approver = rule.conditions.specificApproverId;
      if (approver) {
        const name = approver.firstName && approver.lastName 
          ? `${approver.firstName} ${approver.lastName}`
          : 'Specific approver';
        parts.push(`Requires ${name}`);
      }
    }
    
    if (rule.conditions.approvalSequence && rule.conditions.approvalSequence.length > 0) {
      parts.push(`${rule.conditions.approvalSequence.length} approvers in sequence`);
    }
    
    return parts.join(' • ');
  };

  if (rules.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary border-2 border-secondary rounded-lg">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">No approval rules yet</h3>
        <p className="text-text-secondary">Create your first approval rule to automate expense approvals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <div
          key={rule._id}
          className={`bg-secondary border-2 rounded-lg p-5 transition-all duration-300
            ${rule.isActive ? 'border-accent/30 hover:border-accent' : 'border-text-secondary/30 opacity-60'}`}
        >
          <div className="flex items-start justify-between">
            {/* Rule Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-text-primary font-semibold text-lg">
                  {rule.name}
                </h3>
                
                {/* Active Badge */}
                {rule.isActive ? (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success">
                    ACTIVE
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-text-secondary/10 text-text-secondary border border-text-secondary">
                    INACTIVE
                  </span>
                )}
                
                {/* Priority Badge */}
                {rule.priority > 0 && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent">
                    Priority: {rule.priority}
                  </span>
                )}
              </div>

              {/* Rule Type */}
              <p className="text-accent text-sm mb-2">
                {getRuleTypeLabel(rule.type)}
              </p>

              {/* Rule Description */}
              <p className="text-text-secondary text-sm">
                {getRuleDescription(rule)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onToggleActive(rule)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${rule.isActive 
                    ? 'bg-warning/10 border-2 border-warning text-warning hover:bg-warning hover:text-white' 
                    : 'bg-success/10 border-2 border-success text-success hover:bg-success hover:text-white'
                  }`}
                title={rule.isActive ? 'Deactivate' : 'Activate'}
              >
                {rule.isActive ? '⏸' : '▶'}
              </button>

              <button
                onClick={() => onEdit(rule)}
                className="px-3 py-2 bg-secondary border-2 border-accent text-accent rounded-lg
                  hover:bg-accent hover:text-primary transition-all duration-300 text-sm font-medium"
              >
                ✏️ Edit
              </button>

              <button
                onClick={() => onDelete(rule)}
                className="px-3 py-2 bg-error/10 border-2 border-error text-error rounded-lg
                  hover:bg-error hover:text-white transition-all duration-300 text-sm font-medium"
              >
                🗑️ Delete
              </button>
            </div>
          </div>

          {/* Approval Sequence Details */}
          {rule.conditions.approvalSequence && rule.conditions.approvalSequence.length > 0 && (
            <div className="mt-4 pt-4 border-t border-secondary">
              <p className="text-text-secondary text-xs mb-2">Approval Sequence:</p>
              <div className="flex flex-wrap gap-2">
                {rule.conditions.approvalSequence.map((approver, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-primary rounded text-text-primary text-xs">
                      {index + 1}. {approver.firstName} {approver.lastName}
                    </span>
                    {index < rule.conditions.approvalSequence.length - 1 && (
                      <span className="text-accent">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ApprovalRulesList;
