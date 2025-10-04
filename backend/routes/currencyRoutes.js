import express from 'express';
import * as currencyController from '../controllers/currencyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All currency routes require authentication
router.use(protect);

// GET /api/currency/list - Get all available currencies
router.get('/list', currencyController.getCurrencyList);

// GET /api/currency/convert - Convert amount between currencies
router.get('/convert', currencyController.convertCurrency);

// GET /api/currency/rates - Get exchange rates for a base currency
router.get('/rates', currencyController.getExchangeRates);

export default router;
