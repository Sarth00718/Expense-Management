# Currency Components Documentation

This document describes the currency-related components and utilities available in the application.

## Components

### CurrencySelect

A dropdown component for selecting currencies with search functionality.

**Props:**
- `label` (string): Label for the select field
- `name` (string): Name attribute for the field
- `value` (string): Selected currency code
- `onChange` (function): Change handler
- `error` (string): Error message to display
- `required` (boolean): Whether the field is required
- `disabled` (boolean): Whether the field is disabled
- `showCountries` (boolean): Whether to show country information (default: true)

**Example:**
```jsx
<CurrencySelect
  label="Currency"
  name="currency"
  value={formData.currency}
  onChange={handleChange}
  required
/>
```

### CurrencyConverter

Displays real-time currency conversion with exchange rate details.

**Props:**
- `amount` (number): Amount to convert
- `fromCurrency` (string): Source currency code
- `toCurrency` (string): Target currency code
- `showDetails` (boolean): Whether to show exchange rate details (default: true)

**Example:**
```jsx
<CurrencyConverter
  amount={100}
  fromCurrency="EUR"
  toCurrency="USD"
  showDetails={true}
/>
```

### CurrencyDisplay

Formats and displays currency amounts with optional conversion display.

**Props:**
- `amount` (number): Amount to display
- `currency` (string): Currency code
- `convertedAmount` (number): Converted amount in base currency
- `baseCurrency` (string): Base currency code
- `showConversion` (boolean): Whether to show conversion
- `className` (string): Additional CSS classes

**Example:**
```jsx
<CurrencyDisplay
  amount={150.50}
  currency="EUR"
  convertedAmount={165.25}
  baseCurrency="USD"
  showConversion={true}
/>
```

## Hooks

### useCurrency

Custom hook for currency operations.

**Returns:**
- `currencies` (array): List of available currencies
- `loading` (boolean): Loading state
- `error` (string): Error message if any
- `convertCurrency` (function): Function to convert currency
- `getCurrencyByCode` (function): Get currency object by code
- `formatCurrency` (function): Format amount with currency
- `refetch` (function): Refetch currencies

**Example:**
```jsx
const { currencies, loading, convertCurrency, formatCurrency } = useCurrency();

// Convert currency
const result = await convertCurrency(100, 'USD', 'EUR');

// Format currency
const formatted = formatCurrency(100, 'USD'); // "$100.00"
```

## Services

### currencyService

Service for currency-related API calls.

**Functions:**
- `getCurrencies()`: Fetch all available currencies
- `convertCurrency(amount, from, to)`: Convert amount between currencies
- `getExchangeRates(base)`: Get exchange rates for a base currency

## Integration Example

See `ExpenseFormExample.jsx` for a complete integration example showing how to use currency components in an expense form.

## Features

- **Caching**: Currency data and exchange rates are cached for 1 hour
- **Search**: CurrencySelect includes search functionality
- **Fallback**: Graceful fallback to common currencies if API fails
- **Real-time Conversion**: Automatic conversion display as user types
- **Country Information**: Shows which countries use each currency
- **Error Handling**: Comprehensive error handling with user-friendly messages
