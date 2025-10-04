import api from './api';

/**
 * Fetch all available currencies
 * @returns {Promise<Array>} Array of currency objects
 */
export const getCurrencies = async () => {
  try {
    const response = await api.get('/currency/list');
    return response.data.data.currencies;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error;
  }
};

/**
 * Convert amount between currencies
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency code
 * @param {string} to - Target currency code
 * @returns {Promise<Object>} Conversion result
 */
export const convertCurrency = async (amount, from, to) => {
  try {
    const response = await api.get('/currency/convert', {
      params: { amount, from, to }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
};

/**
 * Get exchange rates for a base currency
 * @param {string} base - Base currency code
 * @returns {Promise<Object>} Exchange rates object
 */
export const getExchangeRates = async (base = 'USD') => {
  try {
    const response = await api.get('/currency/rates', {
      params: { base }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};
