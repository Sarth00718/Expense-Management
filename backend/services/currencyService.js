import axios from 'axios';
import { config } from '../config/config.js';

// In-memory cache for currency data
const cache = {
  currencies: null,
  currenciesTimestamp: null,
  rates: {},
  ratesTimestamp: {}
};

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch all available currencies from REST Countries API
 * @returns {Promise<Array>} Array of currency objects with code, name, and country
 */
export const fetchCurrencies = async () => {
  try {
    // Check cache first
    if (cache.currencies && cache.currenciesTimestamp) {
      const cacheAge = Date.now() - cache.currenciesTimestamp;
      if (cacheAge < CACHE_TTL) {
        console.log('Returning cached currencies');
        return cache.currencies;
      }
    }

    console.log('Fetching currencies from REST Countries API');
    const response = await axios.get(
      `${config.restCountriesApiUrl}?fields=name,currencies`,
      { timeout: 10000 }
    );

    // Process and flatten currency data
    const currencyMap = new Map();
    
    response.data.forEach(country => {
      if (country.currencies) {
        Object.entries(country.currencies).forEach(([code, details]) => {
          if (!currencyMap.has(code)) {
            currencyMap.set(code, {
              code,
              name: details.name,
              symbol: details.symbol || code,
              countries: [country.name.common]
            });
          } else {
            // Add country to existing currency
            const existing = currencyMap.get(code);
            existing.countries.push(country.name.common);
          }
        });
      }
    });

    // Convert map to array and sort by code
    const currencies = Array.from(currencyMap.values()).sort((a, b) => 
      a.code.localeCompare(b.code)
    );

    // Update cache
    cache.currencies = currencies;
    cache.currenciesTimestamp = Date.now();

    return currencies;
  } catch (error) {
    console.error('Error fetching currencies:', error.message);
    
    // Return cached data if available, even if expired
    if (cache.currencies) {
      console.log('Returning stale cached currencies due to API error');
      return cache.currencies;
    }

    // Fallback to common currencies if no cache available
    return getFallbackCurrencies();
  }
};

/**
 * Fetch exchange rates for a base currency
 * @param {string} baseCurrency - Base currency code (e.g., 'USD')
 * @returns {Promise<Object>} Exchange rates object
 */
export const fetchExchangeRates = async (baseCurrency = 'USD') => {
  try {
    // Check cache first
    const cacheKey = baseCurrency.toUpperCase();
    if (cache.rates[cacheKey] && cache.ratesTimestamp[cacheKey]) {
      const cacheAge = Date.now() - cache.ratesTimestamp[cacheKey];
      if (cacheAge < CACHE_TTL) {
        console.log(`Returning cached rates for ${cacheKey}`);
        return cache.rates[cacheKey];
      }
    }

    console.log(`Fetching exchange rates for ${cacheKey}`);
    const response = await axios.get(
      `${config.exchangeRateApiUrl}/${cacheKey}`,
      { timeout: 10000 }
    );

    const ratesData = {
      base: response.data.base,
      date: response.data.date,
      rates: response.data.rates
    };

    // Update cache
    cache.rates[cacheKey] = ratesData;
    cache.ratesTimestamp[cacheKey] = Date.now();

    return ratesData;
  } catch (error) {
    console.error(`Error fetching exchange rates for ${baseCurrency}:`, error.message);
    
    // Return cached data if available, even if expired
    const cacheKey = baseCurrency.toUpperCase();
    if (cache.rates[cacheKey]) {
      console.log(`Returning stale cached rates for ${cacheKey} due to API error`);
      return cache.rates[cacheKey];
    }

    throw new Error(`Unable to fetch exchange rates for ${baseCurrency}. Please try again later.`);
  }
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<Object>} Conversion result with converted amount and rate
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    // Validate inputs
    if (!amount || isNaN(amount) || amount < 0) {
      throw new Error('Invalid amount provided');
    }

    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    // If same currency, no conversion needed
    if (from === to) {
      return {
        amount: parseFloat(amount),
        convertedAmount: parseFloat(amount),
        fromCurrency: from,
        toCurrency: to,
        rate: 1,
        date: new Date().toISOString().split('T')[0]
      };
    }

    // Fetch exchange rates for the source currency
    const ratesData = await fetchExchangeRates(from);

    // Check if target currency exists in rates
    if (!ratesData.rates[to]) {
      throw new Error(`Exchange rate not available for ${to}`);
    }

    const rate = ratesData.rates[to];
    const convertedAmount = parseFloat((amount * rate).toFixed(2));

    return {
      amount: parseFloat(amount),
      convertedAmount,
      fromCurrency: from,
      toCurrency: to,
      rate,
      date: ratesData.date
    };
  } catch (error) {
    console.error('Currency conversion error:', error.message);
    throw error;
  }
};

/**
 * Get fallback currencies when API is unavailable
 * @returns {Array} Array of common currency objects
 */
const getFallbackCurrencies = () => {
  return [
    { code: 'USD', name: 'United States Dollar', symbol: '$', countries: ['United States'] },
    { code: 'EUR', name: 'Euro', symbol: '€', countries: ['European Union'] },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£', countries: ['United Kingdom'] },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', countries: ['Japan'] },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', countries: ['Australia'] },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', countries: ['Canada'] },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', countries: ['Switzerland'] },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', countries: ['China'] },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', countries: ['India'] },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', countries: ['Singapore'] }
  ];
};

/**
 * Clear cache (useful for testing or manual refresh)
 */
export const clearCache = () => {
  cache.currencies = null;
  cache.currenciesTimestamp = null;
  cache.rates = {};
  cache.ratesTimestamp = {};
  console.log('Currency cache cleared');
};
