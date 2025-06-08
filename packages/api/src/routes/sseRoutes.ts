import express from 'express';
import { sseController } from '../controllers';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/sse/user
 * @desc    Subscribe to user-global real-time updates (all lists for the user)
 * @access  Private
 */
router.get('/user', sseController.subscribeToUserEvents);

/**
 * @route   GET /api/sse/status
 * @desc    Get SSE connection status and statistics
 * @access  Private
 */
router.get('/status', sseController.getSSEStatus);

export default router;