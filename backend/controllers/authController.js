import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// @desc    Register company and admin user
// @route   POST /api/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, companyName, baseCurrency } = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !companyName) {
    throw new AppError('Please provide all required fields', 400, 'VALIDATION_ERROR');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400, 'DUPLICATE_FIELD');
  }

  // Create company
  const company = await Company.create({
    name: companyName,
    baseCurrency: baseCurrency || 'USD'
  });

  // Create admin user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: 'admin',
    companyId: company._id
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      user: user.toJSON(),
      company: {
        _id: company._id,
        name: company.name,
        baseCurrency: company.baseCurrency
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400, 'VALIDATION_ERROR');
  }

  // Find user by email (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('User account is inactive', 401, 'UNAUTHORIZED');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
  }

  // Get company details
  const company = await Company.findById(user.companyId);

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    data: {
      user: user.toJSON(),
      company: {
        _id: company._id,
        name: company.name,
        baseCurrency: company.baseCurrency
      },
      token
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint is here for consistency and can be used for logging/analytics
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('managerId', 'firstName lastName email');
  const company = await Company.findById(user.companyId);

  res.status(200).json({
    success: true,
    data: {
      user,
      company: {
        _id: company._id,
        name: company.name,
        baseCurrency: company.baseCurrency,
        settings: company.settings
      }
    }
  });
});
