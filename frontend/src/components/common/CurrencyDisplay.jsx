import React from 'react';

/**
 * Component to display currency amounts with proper formatting
 */
const CurrencyDisplay = ({ 
  amount, 
  currency, 
  convertedAmount = null,
  baseCurrency = null,
  showConversion = false,
  className = ''
}) => {
  const formatAmount = (value, currencyCode) => {
    if (value === null || value === undefined) return '-';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className={className}>
      <div className="text-text-primary font-semibold">
        {formatAmount(amount, currency)}
      </div>
      
      {showConversion && convertedAmount && baseCurrency && currency !== baseCurrency && (
        <div className="text-text-secondary text-sm mt-1">
          ≈ {formatAmount(convertedAmount, baseCurrency)}
        </div>
      )}
    </div>
  );
};

export default CurrencyDisplay;
