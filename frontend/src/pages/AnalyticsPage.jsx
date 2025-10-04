import React from 'react';
import Dashboard from '../components/analytics/Dashboard';

const AnalyticsPage = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          📊 Analytics
        </h1>
        <p className="text-text-secondary">
          View comprehensive expense analytics and insights
        </p>
      </div>
      <Dashboard />
    </div>
  );
};

export default AnalyticsPage;
