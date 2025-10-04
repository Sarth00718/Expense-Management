/**
 * Utility functions for handling receipt URLs and display
 */

/**
 * Get the full receipt URL with proper encoding
 * @param {string} receiptUrl - The receipt URL from the backend
 * @returns {string} - Properly formatted receipt URL
 */
export const getReceiptUrl = (receiptUrl) => {
  if (!receiptUrl) return null;
  
  // If it's already a full URL, return as is
  if (receiptUrl.startsWith('http://') || receiptUrl.startsWith('https://')) {
    return receiptUrl;
  }
  
  // Construct full URL with backend server
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // If it's a relative URL, ensure it's properly encoded
  // Split the URL to encode only the filename part
  const parts = receiptUrl.split('/');
  const filename = parts[parts.length - 1];
  const encodedFilename = encodeURIComponent(filename);
  parts[parts.length - 1] = encodedFilename;
  
  const relativePath = parts.join('/');
  
  // Return full URL
  return `${backendUrl}${relativePath}`;
};

/**
 * Get a placeholder image for when receipt fails to load
 * @returns {string} - Data URL for placeholder image
 */
export const getReceiptPlaceholder = () => {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23334155" width="400" height="300"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="18" font-weight="bold"%3EReceipt Not Available%3C/text%3E%3Ctext x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="14"%3EThe receipt image could not be loaded%3C/text%3E%3C/svg%3E';
};

/**
 * Check if a receipt URL is valid
 * @param {string} receiptUrl - The receipt URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidReceiptUrl = (receiptUrl) => {
  if (!receiptUrl || typeof receiptUrl !== 'string') return false;
  
  // Check if it's a valid URL format
  return receiptUrl.startsWith('/api/') || 
         receiptUrl.startsWith('http://') || 
         receiptUrl.startsWith('https://');
};

/**
 * Extract filename from receipt URL
 * @param {string} receiptUrl - The receipt URL
 * @returns {string} - The filename
 */
export const getReceiptFilename = (receiptUrl) => {
  if (!receiptUrl) return '';
  
  const parts = receiptUrl.split('/');
  return decodeURIComponent(parts[parts.length - 1]);
};
