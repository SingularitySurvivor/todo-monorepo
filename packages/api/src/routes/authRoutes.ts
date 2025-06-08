// src/routes/authRoutes.ts
import express from 'express';
import { authController } from '../controllers';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.registerValidation, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.loginValidation, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   PATCH /api/auth/me
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/me', authenticate, authController.updateProfile);

export default router;