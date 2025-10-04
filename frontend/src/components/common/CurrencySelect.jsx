import React, { useState, useEffect } from 'react';
import { getCurrencies } from '../../services/currencyService';

const CurrencySelect = ({ 
  label = 'Currency', 
  name = 'currency',
  value, 
  onChange, 
  error,
  required = false,
  disabled = false,
  showCountries = true
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const data = await getCurrencies();
      setCurrencies(data);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      // Set fallback currencies
      setCurrencies([
        { code: 'USD', name: 'United States Dollar', symbol: '$', countries: ['United States'] },
        { code: 'EUR', name: 'Euro', symbol: '€', countries: ['European Union'] },
        { code: 'GBP', name: 'British Pound Sterling', symbol: '£', countries: ['United Kingdom'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCurrencies = currencies.filter(currency => 
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (showCountries && currency.countries.some(country => 
      country.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const selectedCurrency = currencies.find(c => c.code === value);

  const handleSelect = (currencyCode) => {
    onChange({ target: { name, value: currencyCode } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="mb-4 relative">
      {label && (
        <label htmlFor={name} className="block text-text-secondary text-sm font-medium mb-2">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || loading}
          className={`w-full px-4 py-3 bg-secondary border-2 rounded-lg text-left
            focus:outline-none focus:border-accent transition-all duration-300
            ${error ? 'border-error' : 'border-secondary'}
            ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-accent/50'}
            flex items-center justify-between`}
        >
          <span className="text-text-primary">
            {loading ? (
              'Loading currencies...'
            ) : selectedCurrency ? (
              <span className="flex items-center gap-2">
                <span className="font-semibold">{selectedCurrency.code}</span>
                <span className="text-text-secondary">({selectedCurrency.symbol})</span>
                <span className="text-text-secondary text-sm">- {selectedCurrency.name}</span>
              </span>
            ) : (
              <span className="text-text-secondary/50">Select currency</span>
            )}
          </span>
          <svg 
            className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && !loading && (
          <div className="absolute z-50 w-full mt-2 bg-secondary border-2 border-accent/30 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search input */}
            <div className="p-3 border-b border-accent/20">
              <input
                type="text"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-accent/30 rounded text-text-primary 
                  placeholder-text-secondary/50 focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>

            {/* Currency list */}
            <div className="overflow-y-auto max-h-64">
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleSelect(currency.code)}
                    className={`w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors duration-200
                      ${value === currency.code ? 'bg-accent/20' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text-primary">{currency.code}</span>
                          <span className="text-accent">({currency.symbol})</span>
                        </div>
                        <div className="text-sm text-text-secondary mt-1">{currency.name}</div>
                        {showCountries && currency.countries && currency.countries.length > 0 && (
                          <div className="text-xs text-text-secondary/70 mt-1">
                            {currency.countries.slice(0, 3).join(', ')}
                            {currency.countries.length > 3 && ` +${currency.countries.length - 3} more`}
                          </div>
                        )}
                      </div>
                      {value === currency.code && (
                        <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-text-secondary">
                  No currencies found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CurrencySelect;
