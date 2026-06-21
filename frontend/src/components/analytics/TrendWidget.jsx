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
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-text-secondary text-xs sm:text-sm mb-1 sm:mb-2 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center text-xs sm:text-sm ${trendColors[trend]}`}>
              <span className="mr-1">{trendIcons[trend]}</span>
              <span>{Math.abs(change)}%</span>
              <span className="ml-1 text-text-secondary">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-3xl sm:text-4xl opacity-20 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TrendWidget;
