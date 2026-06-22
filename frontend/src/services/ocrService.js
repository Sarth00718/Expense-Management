import Tesseract from 'tesseract.js';

/**
 * Preprocess image for better OCR results
 * @param {File|string} image - Image file or URL
 * @returns {Promise<string>} Processed image as data URL
 */
const preprocessImage = async (image) => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Resize image to optimal size for OCR (2000px max width, maintain aspect ratio)
      const maxWidth = 2000;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and convert to grayscale
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        // Increase contrast
        const contrast = 1.3; // Contrast factor
        const contrasted = Math.min(255, Math.max(0, Math.round((gray - 128) * contrast + 128)));
        data[i] = contrasted;
        data[i + 1] = contrasted;
        data[i + 2] = contrasted;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    if (image instanceof File) {
      img.src = URL.createObjectURL(image);
    } else {
      img.src = image;
    }
  });
};

/**
 * OCR Service for processing receipt images and extracting expense data
 * Uses Tesseract.js for client-side OCR processing
 */

// Category keywords mapping for smart suggestions
const CATEGORY_KEYWORDS = {
  travel: ['uber', 'lyft', 'taxi', 'flight', 'airline', 'hotel', 'airbnb', 'rental', 'gas', 'fuel', 'parking', 'toll', 'walmart', 'target', 'costco'],
  food: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'pizza', 'burger', 'food', 'dining', 'lunch', 'dinner', 'breakfast', 'grocery', 'supermarket', 'kroger', 'safeway', 'walgreens', 'cvs', 'doordash', 'ubereats', 'grubhub', 'instacart'],
  office_supplies: ['staples', 'office', 'depot', 'paper', 'pen', 'printer', 'ink', 'supplies', 'amazon', 'best buy', 'home depot', 'lowes', 'ikea'],
  entertainment: ['movie', 'cinema', 'theater', 'theatre', 'concert', 'show', 'ticket', 'netflix', 'spotify', 'entertainment', 'game', 'amusement', 'apple', 'google', 'microsoft'],
  utilities: ['electric', 'electricity', 'water', 'gas', 'internet', 'phone', 'utility', 'utilities', 'bill', 'telecom', 'paypal', 'invoice', 'receipt'],
  other: []
};

/**
 * Process receipt image with OCR
 * @param {File|string} image - Image file or URL
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} Extracted data with confidence scores
 */
export const processReceipt = async (image, onProgress = null) => {
  try {
    // Preprocess the image first
    const preprocessedImage = await preprocessImage(image);

    // Try different page segmentation modes
    const pageSegModes = ['6', '3', '1']; // 6: Uniform block, 3: Auto, 1: Single column
    let bestResult = null;
    let bestConfidence = 0;

    for (const mode of pageSegModes) {
      const result = await Tesseract.recognize(
        preprocessedImage,
        'eng',
        {
          logger: (m) => {
            if (onProgress && m.status === 'recognizing text') {
              // Adjust progress for multiple tries
              const progressPerTry = 100 / pageSegModes.length;
              const currentTry = pageSegModes.indexOf(mode);
              onProgress(Math.round(currentTry * progressPerTry + (m.progress * progressPerTry)));
            }
          },
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,$-/: ',
          preserve_interword_spaces: '1',
          tessedit_pageseg_mode: mode
        }
      );

      // Evaluate which result is better
      const vendor = extractVendor(result.data.text);
      const amount = extractAmount(result.data.text);
      const date = extractDate(result.data.text);
      
      // Calculate a score based on extracted fields
      let score = result.data.confidence;
      if (vendor) score += 10;
      if (amount) score += 20;
      if (date) score += 15;

      if (score > bestConfidence) {
        bestConfidence = score;
        bestResult = result;
      }
    }

    if (!bestResult) {
      throw new Error('Failed to process receipt');
    }

    const text = bestResult.data.text;
    const confidence = bestResult.data.confidence;

    // Extract data from OCR text
    const extractedData = {
      vendor: extractVendor(text),
      amount: extractAmount(text),
      date: extractDate(text),
      category: suggestCategory(text),
      rawText: text,
      confidence: confidence,
      fieldConfidence: {
        vendor: calculateFieldConfidence(text, 'vendor'),
        amount: calculateFieldConfidence(text, 'amount'),
        date: calculateFieldConfidence(text, 'date')
      }
    };

    return {
      success: true,
      data: extractedData
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process receipt'
    };
  }
};

/**
 * Extract vendor name from receipt text
 * Looks for business name patterns at the top of the receipt
 */
const extractVendor = (text) => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // List of known vendors to prioritize
  const knownVendors = [
    'Walmart', 'Target', 'Amazon', 'Starbucks', 'McDonald', 'Kroger',
    'Safeway', 'Walgreens', 'CVS', 'Costco', 'Sam\'s Club', '7-Eleven',
    'Shell', 'Exxon', 'Chevron', 'BP', 'Uber', 'Lyft', 'DoorDash',
    'Uber Eats', 'Grubhub', 'Instacart', 'Best Buy', 'Home Depot',
    'Lowe\'s', 'IKEA', 'Apple', 'Google', 'Microsoft', 'PayPal',
    'INV24', 'Invoice', 'Receipt'
  ];
  
  // Check for known vendors first
  const lowerText = text.toLowerCase();
  for (const vendor of knownVendors) {
    if (lowerText.includes(vendor.toLowerCase())) {
      return vendor;
    }
  }
  
  // Usually vendor name is in the first few lines
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    // Look for lines with capital letters and reasonable length
    if (line.length > 2 && line.length < 80 && /[A-Z]/.test(line)) {
      // Skip lines that look like addresses or phone numbers
      if (!/\d{5,}/.test(line) && !/street|st\.|ave|avenue|road|rd\.|blvd|boulevard|lane|ln\.|drive|dr\.|circle|cir\.|court|ct\./i.test(line)) {
        // Clean up the line
        return line.replace(/[^\w\s&'-]/g, '').trim();
      }
    }
  }
  
  return '';
};

/**
 * Extract amount from receipt text
 * Looks for total amount patterns
 */
const extractAmount = (text) => {
  const patterns = [
    /total[:\s]*\$?\s*([\d.,]+)/gi,
    /amount[:\s]*\$?\s*([\d.,]+)/gi,
    /balance[:\s]*\$?\s*([\d.,]+)/gi,
    /subtotal[:\s]*\$?\s*([\d.,]+)/gi,
    /due[:\s]*\$?\s*([\d.,]+)/gi,
    /paid[:\s]*\$?\s*([\d.,]+)/gi,
    /\$\s*([\d.,]+)/g,
    /(\d+[.,]\d{2})/g
  ];

  let amounts = [];
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      if (match && (match[1] || match[0])) {
        const amountStr = match[1] || match[0].replace(/\$/, '');
        const amount = parseFloat(amountStr.replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0 && amount < 1000000) {
          amounts.push(amount);
        }
      }
    }
  }
  
  // Return the largest amount (likely the total)
  if (amounts.length > 0) {
    return Math.max(...amounts);
  }

  return null;
};

/**
 * Extract date from receipt text
 * Looks for common date patterns
 */
const extractDate = (text) => {
  const patterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    // Month DD, YYYY
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
    // YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    // DD Month YYYY
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Try to parse the date
        let date;
        if (match[0].includes('/') || match[0].includes('-')) {
          const parts = match[0].split(/[\/\-]/);
          if (parts.length === 3) {
            let year, month, day;
            if (parts[0].length === 4) {
              // YYYY-MM-DD
              year = parseInt(parts[0]);
              month = parseInt(parts[1]);
              day = parseInt(parts[2]);
            } else if (parts[2].length === 4) {
              // MM/DD/YYYY or DD/MM/YYYY
              year = parseInt(parts[2]);
              if (parseInt(parts[0]) > 12) {
                // DD/MM/YYYY
                month = parseInt(parts[1]);
                day = parseInt(parts[0]);
              } else {
                // MM/DD/YYYY
                month = parseInt(parts[0]);
                day = parseInt(parts[1]);
              }
            } else {
              // Two-digit year
              year = parseInt('20' + parts[2]);
              if (parseInt(parts[0]) > 12) {
                month = parseInt(parts[1]);
                day = parseInt(parts[0]);
              } else {
                month = parseInt(parts[0]);
                day = parseInt(parts[1]);
              }
            }
            date = new Date(year, month - 1, day);
          }
        } else {
          // Month name format
          date = new Date(match[0]);
        }
        
        // Validate the date is reasonable (not in future, not too old)
        const now = new Date();
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);
        
        if (date <= now && date >= fiveYearsAgo && !isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
        }
      } catch (e) {
        continue;
      }
    }
  }

  return null;
};

/**
 * Suggest expense category based on vendor and text content
 */
const suggestCategory = (text) => {
  const lowerText = text.toLowerCase();
  
  let maxMatches = 0;
  let suggestedCategory = 'other';
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'other') continue;
    
    let matches = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        matches++;
      }
    }
    
    if (matches > maxMatches) {
      maxMatches = matches;
      suggestedCategory = category;
    }
  }
  
  return suggestedCategory;
};

/**
 * Calculate confidence score for a specific field
 * Returns a score between 0 and 100
 */
const calculateFieldConfidence = (text, field) => {
  let confidence = 50; // Base confidence
  
  switch (field) {
    case 'vendor':
      // Higher confidence if we found text in first few lines
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 0 && lines[0].trim().length > 3) {
        confidence = 75;
      }
      break;
      
    case 'amount':
      // Higher confidence if we found "total" or "amount" keywords
      if (/total|amount|balance/i.test(text)) {
        confidence = 85;
      } else if (/\$\s*\d+[.,]\d{2}/.test(text)) {
        confidence = 70;
      }
      break;
      
    case 'date':
      // Higher confidence if date format is clear
      if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text)) {
        confidence = 80;
      }
      break;
  }
  
  return confidence;
};

/**
 * Validate extracted data
 * Returns validation errors if any
 */
export const validateExtractedData = (data) => {
  const errors = {};
  
  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Could not extract valid amount';
  }
  
  if (!data.date) {
    errors.date = 'Could not extract date';
  }
  
  if (!data.vendor || data.vendor.length < 2) {
    errors.vendor = 'Could not extract vendor name';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  processReceipt,
  validateExtractedData
};
