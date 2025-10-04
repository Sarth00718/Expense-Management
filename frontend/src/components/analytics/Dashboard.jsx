import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ExpenseChart from './ExpenseChart';
import CategoryBreakdown from './CategoryBreakdown';
import ApprovalStats from './ApprovalStats';
import TrendWidget from './TrendWidget';
import TopSpenders from './TopSpenders';
import UnusualSpendingAlerts from './UnusualSpendingAlerts';
import ExportModal from './ExportModal';
import Card from '../common/Card';
import Loader from '../common/Loader';
import Button from '../common/Button';
import {
  getDashboardStats,
  getExpensesByCategory,
  getExpensesByMonth,
  getApprovalStats
} from '../../services/analyticsService';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [approvalData, setApprovalData] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboard, category, monthly, approval] = await Promise.all([
        getDashboardStats(),
        getExpensesByCategory(),
        getExpensesByMonth({ months: 6 }),
        getApprovalStats()
      ]);

      setDashboardData(dashboard.data);
      setCategoryData(category.data);
      setMonthlyData(monthly.data);
      setApprovalData(approval.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
        <p className="text-text-secondary mt-4">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-error text-lg mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-secondary transition-colors"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const topSpenders = dashboardData?.topSpenders || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section with Export Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-text-secondary">
            Here's an overview of your expense activity
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TrendWidget
          title="Total Expenses"
          value={summary.totalExpenses || 0}
          icon="📊"
        />
        <TrendWidget
          title="Total Amount"
          value={`$${(summary.totalAmount || 0).toFixed(2)}`}
          icon="💰"
        />
        <TrendWidget
          title="Pending Approval"
          value={summary.pendingCount || 0}
          icon="⏳"
        />
        <TrendWidget
          title="Approved"
          value={summary.approvedCount || 0}
          icon="✓"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80 md:h-96">
          <ExpenseChart data={monthlyData} title="Expense Trends" />
        </Card>
        <Card className="h-80 md:h-96">
          <CategoryBreakdown data={categoryData} />
        </Card>
      </div>

      {/* Approval Stats and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80 md:h-96">
          {approvalData && <ApprovalStats data={approvalData} />}
        </Card>
        <div className="space-y-6">
          <UnusualSpendingAlerts data={categoryData} />
          {(user?.role === 'manager' || user?.role === 'admin') && topSpenders.length > 0 && (
            <TopSpenders data={topSpenders} />
          )}
        </div>
      </div>

      {/* Additional Stats for Managers/Admins */}
      {(user?.role === 'manager' || user?.role === 'admin') && approvalData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-text-secondary text-sm mb-2">Pending Your Approval</p>
            <p className="text-3xl font-bold text-warning">{approvalData.pendingApprovals}</p>
          </Card>
          <Card>
            <p className="text-text-secondary text-sm mb-2">Approval Rate</p>
            <p className="text-3xl font-bold text-success">
              {summary.approvedCount > 0
                ? ((summary.approvedCount / (summary.approvedCount + summary.rejectedCount)) * 100).toFixed(1)
                : 0}%
            </p>
          </Card>
          <Card>
            <p className="text-text-secondary text-sm mb-2">Avg. Approval Time</p>
            <p className="text-3xl font-bold text-accent">
              {approvalData.approvalTime
                ? `${approvalData.approvalTime.avgApprovalTimeHours.toFixed(1)}h`
                : 'N/A'}
            </p>
          </Card>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
