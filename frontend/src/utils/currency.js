
export const formatCurrency = (amount, currency) => {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
  // Default to USD
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
};
