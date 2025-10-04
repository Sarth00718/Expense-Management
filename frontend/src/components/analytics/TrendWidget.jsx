import React from 'react';
import Card from '../common/Card';

const TrendWidget = ({ title, value, change, icon, trend = 'neutral' }) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-text-secondary'
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  return (
    <Card className="hover:border-accent/50 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-secondary text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center text-sm ${trendColors[trend]}`}>
              <span className="mr-1">{trendIcons[trend]}</span>
              <span>{Math.abs(change)}%</span>
              <span className="ml-1 text-text-secondary">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-4xl opacity-20">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TrendWidget;
