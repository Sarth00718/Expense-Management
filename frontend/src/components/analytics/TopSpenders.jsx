import React from 'react';
import Card from '../common/Card';

const TopSpenders = ({ data }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">Top Spenders</h3>
      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((spender, index) => (
            <div 
              key={spender.employeeId} 
              className="flex items-center justify-between p-3 bg-primary/50 rounded-lg border border-accent/20 hover:border-accent/40 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="text-white font-medium">{spender.employeeName}</p>
                  <p className="text-text-secondary text-sm">{spender.expenseCount} expenses</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-accent font-bold">${spender.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-secondary text-center py-4">No data available</p>
      )}
    </Card>
  );
};

export default TopSpenders;
