// src/controllers/authController.ts
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services';
import { asyncHandler, ApiError } from '../utils';
import { IUser } from '../types';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for password update
 */
export const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const { email, password, firstName, lastName } = req.body;
  
  const { user, token } = await authService.registerUser({
    email,
    password,
    firstName,
    lastName,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const { email, password } = req.body;
  
  const { user, token } = await authService.loginUser({
    email,
    password,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token. However, we can provide a logout endpoint
  // for consistency and future token blacklisting if needed.
  
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Logout successful',
    },
  });
});

/**
 * Get current logged in user
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User not authenticated');
  }

  const user = await authService.getUserById(userId);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User not authenticated');
  }

  const { firstName, lastName, email } = req.body;
  
  // Basic validation
  if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw ApiError.validationError('Please provide a valid email');
  }

  const updatedUser = await authService.updateUser(userId, {
    firstName,
    lastName,
    email,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * Update user password
 */
export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const userId = req.user?.id;
  if (!userId) {
    throw ApiError.unauthorized('User not authenticated');
  }

  const { currentPassword, password } = req.body;
  
  const updatedUser = await authService.updatePassword(userId, currentPassword, password);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});