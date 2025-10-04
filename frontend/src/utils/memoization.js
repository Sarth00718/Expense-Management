/**
 * Simple memoization utility for expensive computations
 * @param {Function} fn - Function to memoize
 * @param {Function} keyGenerator - Optional function to generate cache key
 * @returns {Function} Memoized function
 */
export const memoize = (fn, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map();

  return function memoized(...args) {
    const key = keyGenerator(...args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);

    return result;
  };
};

/**
 * Memoize with TTL (Time To Live)
 * @param {Function} fn - Function to memoize
 * @param {number} ttl - Time to live in milliseconds
 * @param {Function} keyGenerator - Optional function to generate cache key
 * @returns {Function} Memoized function with TTL
 */
export const memoizeWithTTL = (fn, ttl = 60000, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map();

  return function memoized(...args) {
    const key = keyGenerator(...args);
    const now = Date.now();

    if (cache.has(key)) {
      const { value, timestamp } = cache.get(key);
      
      if (now - timestamp < ttl) {
        return value;
      }
      
      // Remove expired entry
      cache.delete(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, { value: result, timestamp: now });

    return result;
  };
};

/**
 * Clear memoization cache
 * @param {Function} memoizedFn - Memoized function
 */
export const clearMemoCache = (memoizedFn) => {
  if (memoizedFn.cache) {
    memoizedFn.cache.clear();
  }
};

/**
 * Memoize expensive calculations for analytics
 */
export const memoizeAnalytics = {
  /**
   * Calculate total by category with memoization
   */
  calculateTotalByCategory: memoize((expenses) => {
    return expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.convertedAmount;
      return acc;
    }, {});
  }),

  /**
   * Calculate monthly totals with memoization
   */
  calculateMonthlyTotals: memoize((expenses) => {
    return expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + expense.convertedAmount;
      return acc;
    }, {});
  }),

  /**
   * Calculate approval statistics with memoization
   */
  calculateApprovalStats: memoize((expenses) => {
    return expenses.reduce((acc, expense) => {
      acc[expense.status] = (acc[expense.status] || 0) + 1;
      return acc;
    }, {
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0
    });
  })
};
