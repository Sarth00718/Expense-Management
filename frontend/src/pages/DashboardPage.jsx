import React from 'react';
import Dashboard from '../components/analytics/Dashboard';

const DashboardPage = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          📈 Dashboard
        </h1>
        <p className="text-text-secondary">
          Overview of your expense management activities
        </p>
      </div>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
