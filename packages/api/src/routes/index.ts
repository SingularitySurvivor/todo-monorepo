import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import todoRoutes from './todoRoutes';
import todoListRoutes from './todoListRoutes';
import sseRoutes from './sseRoutes';

const router = express.Router();

// Authentication routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Todo routes
router.use('/todos', todoRoutes);

// Todo list routes
router.use('/todo-lists', todoListRoutes);
router.use('/lists', todoListRoutes);  // Alias for backward compatibility

// Server-Sent Events routes
router.use('/sse', sseRoutes);

export default router;