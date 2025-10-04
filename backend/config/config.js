import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  uploadDir: process.env.UPLOAD_DIR || 'uploads/receipts',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
  exchangeRateApiUrl: process.env.EXCHANGE_RATE_API_URL,
  restCountriesApiUrl: process.env.REST_COUNTRIES_API_URL,
};
