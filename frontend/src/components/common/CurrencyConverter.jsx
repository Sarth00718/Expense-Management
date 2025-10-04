import React, { useState, useEffect } from 'react';
import { convertCurrency } from '../../services/currencyService';

const CurrencyConverter = ({ 
  amount, 
  fromCurrency, 
  toCurrency,
  showDetails = true 
}) => {
  const [conversion, setConversion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency && amount > 0) {
      performConversion();
    } else {
      setConversion(null);
    }
  }, [amount, fromCurrency, toCurrency]);

  const performConversion = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await convertCurrency(amount, fromCurrency, toCurrency);
      setConversion(result);
    } catch (err) {
      console.error('Conversion error:', err);
      setError('Unable to convert currency. Please try again.');
      setConversion(null);
    } finally {
      setLoading(false);
    }
  };

  if (!amount || !fromCurrency || !toCurrency || amount <= 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-text-secondary text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent"></div>
        <span>Converting...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-error text-sm flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (!conversion) {
    return null;
  }

  // If same currency, don't show conversion
  if (fromCurrency === toCurrency) {
    return null;
  }

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="text-text-secondary text-sm">
          Converted Amount:
        </div>
        <div className="text-accent font-semibold text-lg">
          {conversion.convertedAmount.toFixed(2)} {conversion.toCurrency}
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-2 pt-2 border-t border-accent/10">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Exchange Rate:</span>
            <span>1 {conversion.fromCurrency} = {conversion.rate.toFixed(4)} {conversion.toCurrency}</span>
          </div>
          {conversion.date && (
            <div className="flex items-center justify-between text-xs text-text-secondary mt-1">
              <span>Rate Date:</span>
              <span>{conversion.date}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;
