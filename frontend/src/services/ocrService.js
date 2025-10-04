import Tesseract from 'tesseract.js';

/**
 * OCR Service for processing receipt images and extracting expense data
 * Uses Tesseract.js for client-side OCR processing
 */

// Category keywords mapping for smart suggestions
const CATEGORY_KEYWORDS = {
  travel: ['uber', 'lyft', 'taxi', 'flight', 'airline', 'hotel', 'airbnb', 'rental', 'gas', 'fuel', 'parking', 'toll'],
  food: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'pizza', 'burger', 'food', 'dining', 'lunch', 'dinner', 'breakfast'],
  office_supplies: ['staples', 'office', 'depot', 'paper', 'pen', 'printer', 'ink', 'supplies', 'amazon'],
  entertainment: ['movie', 'cinema', 'theater', 'theatre', 'concert', 'show', 'ticket', 'netflix', 'spotify', 'entertainment', 'game', 'amusement'],
  utilities: ['electric', 'electricity', 'water', 'gas', 'internet', 'phone', 'utility', 'utilities', 'bill', 'telecom'],
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
    const result = await Tesseract.recognize(
      image,
      'eng',
      {
        logger: (m) => {
          if (onProgress && m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        }
      }
    );

    const text = result.data.text;
    const confidence = result.data.confidence;

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
  
  // Usually vendor name is in the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Look for lines with capital letters and reasonable length
    if (line.length > 3 && line.length < 50 && /[A-Z]/.test(line)) {
      // Skip lines that look like addresses or phone numbers
      if (!/\d{3,}/.test(line) && !/street|st\.|ave|road|rd\.|blvd/i.test(line)) {
        return line;
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
    /total[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /amount[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /balance[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /\$\s*(\d+[.,]\d{2})/g
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      // Extract the numeric value
      const amountStr = matches[1] || matches[0];
      const amount = parseFloat(amountStr.replace(/[,$]/g, '').replace(',', '.'));
      if (!isNaN(amount) && amount > 0 && amount < 1000000) {
        return amount;
      }
    }
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
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Try to parse the date
        const dateStr = match[0];
        const date = new Date(dateStr);
        
        // Validate the date is reasonable (not in future, not too old)
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        
        if (date <= now && date >= oneYearAgo && !isNaN(date.getTime())) {
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
