import express from 'express';
import { userController } from '../controllers';
import { authenticate, isAdmin } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (admin only)
 */
router.get('/', isAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (admin only)
 */
router.get('/:id', isAdmin, userController.getUser);

// Removed /me route - moved to auth routes for password updates
// All user routes are now admin-only

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user by ID
 * @access  Private (admin only)
 */
router.patch(
  '/:id',
  isAdmin,
  userController.updateUserByAdminValidation,
  userController.updateUser
);

export default router;