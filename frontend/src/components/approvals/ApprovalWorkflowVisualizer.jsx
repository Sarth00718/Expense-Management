import React from 'react';

const ApprovalWorkflowVisualizer = ({ expense }) => {
  if (!expense) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Build timeline from approval history
  const timeline = [
    {
      status: 'submitted',
      label: 'Submitted',
      user: expense.employeeId,
      timestamp: expense.createdAt,
      completed: true
    }
  ];

  // Add approval history
  if (expense.approvalHistory && expense.approvalHistory.length > 0) {
    expense.approvalHistory.forEach((history) => {
      timeline.push({
        status: history.action,
        label: history.action === 'approved' ? 'Approved' : history.action === 'rejected' ? 'Rejected' : 'Overridden',
        user: history.approverId,
        timestamp: history.timestamp,
        comment: history.comment,
        completed: true
      });
    });
  }

  // Add current pending approval if exists
  if (expense.status === 'pending' && expense.currentApproverId) {
    timeline.push({
      status: 'pending',
      label: 'Pending Approval',
      user: expense.currentApproverId,
      timestamp: null,
      completed: false
    });
  }

  // Add final status
  if (expense.status === 'approved') {
    if (!timeline.some(t => t.status === 'approved')) {
      timeline.push({
        status: 'approved',
        label: 'Approved',
        timestamp: expense.updatedAt,
        completed: true
      });
    }
  } else if (expense.status === 'rejected') {
    if (!timeline.some(t => t.status === 'rejected')) {
      timeline.push({
        status: 'rejected',
        label: 'Rejected',
        timestamp: expense.updatedAt,
        completed: true
      });
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-accent border-accent';
      case 'approved':
      case 'overridden':
        return 'bg-success border-success';
      case 'rejected':
        return 'bg-error border-error';
      case 'pending':
        return 'bg-warning border-warning animate-pulse';
      default:
        return 'bg-text-secondary border-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return '📤';
      case 'approved':
        return '✓';
      case 'overridden':
        return '⚡';
      case 'rejected':
        return '✗';
      case 'pending':
        return '⏳';
      default:
        return '•';
    }
  };

  return (
    <div className="bg-secondary border border-accent/20 rounded-lg p-6">
      <h3 className="text-text-primary font-semibold text-lg mb-6">Approval Workflow</h3>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-secondary" />

        {/* Timeline Items */}
        <div className="space-y-6">
          {timeline.map((item, index) => (
            <div key={index} className="relative flex items-start gap-4">
              {/* Status Icon */}
              <div className={`relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center text-xl
                ${item.completed ? getStatusColor(item.status) : 'bg-secondary border-text-secondary'}`}>
                {getStatusIcon(item.status)}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className={`font-semibold ${item.completed ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {item.label}
                  </h4>
                  {item.timestamp && (
                    <span className="text-text-secondary text-xs">
                      {formatDate(item.timestamp)}
                    </span>
                  )}
                </div>

                {item.user && (
                  <p className="text-text-secondary text-sm">
                    {item.user.firstName} {item.user.lastName}
                  </p>
                )}

                {item.comment && (
                  <div className="mt-2 p-3 bg-primary/50 border border-accent/10 rounded text-sm text-text-primary">
                    <p className="text-text-secondary text-xs mb-1">Comment:</p>
                    "{item.comment}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflowVisualizer;
