import * as currencyService from '../services/currencyService.js';

/**
 * Get list of all available currencies
 * GET /api/currency/list
 */
export const getCurrencyList = async (req, res, next) => {
  try {
    const currencies = await currencyService.fetchCurrencies();
    
    res.json({
      success: true,
      data: {
        currencies,
        count: currencies.length
      }
    });
  } catch (error) {
    next({
      status: 500,
      code: 'CURRENCY_FETCH_ERROR',
      message: 'Failed to fetch currency list',
      originalError: error.message
    });
  }
};

/**
 * Convert amount between currencies
 * GET /api/currency/convert?amount=100&from=USD&to=EUR
 */
export const convertCurrency = async (req, res, next) => {
  try {
    const { amount, from, to } = req.query;

    // Validate required parameters
    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required parameters: amount, from, and to are required'
        }
      });
    }

    // Validate amount is a number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount must be a valid positive number'
        }
      });
    }

    const result = await currencyService.convertCurrency(numAmount, from, to);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    // Check if it's a validation error from the service
    if (error.message.includes('Invalid amount') || 
        error.message.includes('not available')) {
      return next({
        status: 400,
        code: 'CONVERSION_ERROR',
        message: error.message
      });
    }

    next({
      status: 500,
      code: 'CONVERSION_ERROR',
      message: 'Failed to convert currency',
      originalError: error.message
    });
  }
};

/**
 * Get exchange rates for a specific base currency
 * GET /api/currency/rates?base=USD
 */
export const getExchangeRates = async (req, res, next) => {
  try {
    const { base = 'USD' } = req.query;
    
    const rates = await currencyService.fetchExchangeRates(base);
    
    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    next({
      status: 500,
      code: 'RATES_FETCH_ERROR',
      message: error.message || 'Failed to fetch exchange rates'
    });
  }
};
