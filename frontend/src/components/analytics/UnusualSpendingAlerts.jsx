import React from 'react';
import Card from '../common/Card';

const UnusualSpendingAlerts = ({ data }) => {
  // Detect unusual spending patterns
  const detectAnomalies = (categoryData) => {
    if (!categoryData || categoryData.length === 0) return [];
    
    const alerts = [];
    
    // Calculate average spending per category
    const avgAmount = categoryData.reduce((sum, cat) => sum + cat.totalAmount, 0) / categoryData.length;
    
    // Find categories with spending significantly above average (>150%)
    categoryData.forEach(cat => {
      if (cat.totalAmount > avgAmount * 1.5) {
        alerts.push({
          type: 'high',
          category: cat.category,
          amount: cat.totalAmount,
          message: `${cat.category.replace('_', ' ')} spending is ${((cat.totalAmount / avgAmount - 1) * 100).toFixed(0)}% above average`
        });
      }
    });
    
    return alerts;
  };

  const alerts = detectAnomalies(data);

  const categoryLabels = {
    travel: 'Travel',
    food: 'Food',
    office_supplies: 'Office Supplies',
    other: 'Other'
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">Spending Alerts</h3>
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div 
              key={index}
              className="p-3 bg-warning/10 border border-warning/30 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <div className="text-warning text-xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-white font-medium capitalize">
                    {categoryLabels[alert.category] || alert.category}
                  </p>
                  <p className="text-text-secondary text-sm mt-1">{alert.message}</p>
                  <p className="text-warning text-sm font-semibold mt-1">
                    ${alert.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">✓</div>
          <p className="text-success text-sm">All spending within normal range</p>
        </div>
      )}
    </Card>
  );
};

export default UnusualSpendingAlerts;
