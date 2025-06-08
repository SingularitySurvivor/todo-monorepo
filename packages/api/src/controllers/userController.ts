import { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { userService } from '../services';
import { asyncHandler, ApiError } from '../utils';
import { AuthRequest } from '../middlewares/auth';

/**
 * Validation rules for updating a user
 */
export const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty if provided')
    .isLength({ max: 255 })
    .withMessage('First name cannot exceed 255 characters')
    .escape(), // Sanitize HTML
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty if provided')
    .isLength({ max: 255 })
    .withMessage('Last name cannot exceed 255 characters')
    .escape(), // Sanitize HTML
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

/**
 * Validation rules for updating a user by admin
 */
export const updateUserByAdminValidation = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty if provided')
    .isLength({ max: 255 })
    .withMessage('First name cannot exceed 255 characters')
    .escape(), // Sanitize HTML
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty if provided')
    .isLength({ max: 255 })
    .withMessage('Last name cannot exceed 255 characters')
    .escape(), // Sanitize HTML
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be either admin or user'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

/**
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await userService.getAllUsers();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

/**
 * Get user by ID
 */
export const getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const user = await userService.getUserById(id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * Update current user
 */
export const updateCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const userId = req.user.id;
  const updateData = req.body;
  
  // Filter out unknown fields to ignore them
  const allowedFields = ['firstName', 'lastName', 'password'];
  const filteredData: any = {};
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }
  
  const user = await userService.updateUser(userId, filteredData);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * Update user by ID (admin only)
 */
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const { id } = req.params;
  const updateData = req.body;
  
  const user = await userService.updateUser(id, updateData);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});