import { useState, useEffect } from 'react';
import { getCurrencies, convertCurrency as convertCurrencyAPI } from '../services/currencyService';

/**
 * Custom hook for currency operations
 */
export const useCurrency = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState('USD');

  useEffect(() => {
    fetchCurrencies();
    loadBaseCurrency();
  }, []);

  const loadBaseCurrency = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.company?.baseCurrency) {
          setBaseCurrency(user.company.baseCurrency);
        }
      }
    } catch (err) {
      console.error('Failed to load base currency:', err);
      setBaseCurrency('USD'); // Fallback to USD
    }
  };

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrencies();
      setCurrencies(data);
    } catch (err) {
      console.error('Failed to fetch currencies:', err);
      setError('Failed to load currencies');
      // Set fallback currencies
      setCurrencies([
        { code: 'USD', name: 'United States Dollar', symbol: '$', countries: ['United States'] },
        { code: 'EUR', name: 'Euro', symbol: '€', countries: ['European Union'] },
        { code: 'GBP', name: 'British Pound Sterling', symbol: '£', countries: ['United Kingdom'] },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', countries: ['Japan'] },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', countries: ['Canada'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const convertCurrency = async (amount, from, to) => {
    try {
      const result = await convertCurrencyAPI(amount, from, to);
      return result;
    } catch (err) {
      console.error('Conversion failed:', err);
      throw err;
    }
  };

  const getCurrencyByCode = (code) => {
    return currencies.find(c => c.code === code);
  };

  const formatCurrency = (amount, currencyCode) => {
    if (amount === null || amount === undefined) return '-';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      // Fallback if currency code is invalid
      return `${amount.toFixed(2)} ${currencyCode}`;
    }
  };

  return {
    currencies,
    baseCurrency,
    loading,
    error,
    convertCurrency,
    getCurrencyByCode,
    formatCurrency,
    refetch: fetchCurrencies
  };
};
