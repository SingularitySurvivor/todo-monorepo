import express from 'express';
import { todoController } from '../controllers';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/todos
 * @desc    Create a new todo
 * @access  Private
 */
router.post(
  '/',
  todoController.createTodoValidation,
  todoController.createTodo
);

/**
 * @route   GET /api/todos
 * @desc    Get all todos for the current user
 * @access  Private
 */
router.get(
  '/',
  todoController.getTodosValidation,
  todoController.getTodos
);

/**
 * @route   GET /api/todos/stats
 * @desc    Get todo statistics for the current user
 * @access  Private
 */
router.get('/stats', todoController.getTodoStats);

/**
 * @route   GET /api/todos/list/:listId
 * @desc    Get all todos for a specific list
 * @access  Private
 */
router.get(
  '/list/:listId',
  todoController.getTodosValidation,
  todoController.getTodosByList
);

/**
 * @route   GET /api/todos/list/:listId/stats
 * @desc    Get todo statistics for a specific list
 * @access  Private
 */
router.get('/list/:listId/stats', todoController.getTodoStatsForList);

/**
 * @route   GET /api/todos/:id
 * @desc    Get a specific todo by ID
 * @access  Private
 */
router.get('/:id', todoController.getTodo);

/**
 * @route   PATCH /api/todos/:id
 * @desc    Update a todo
 * @access  Private
 */
router.patch(
  '/:id',
  todoController.updateTodoValidation,
  todoController.updateTodo
);

/**
 * @route   DELETE /api/todos/:id
 * @desc    Delete a todo
 * @access  Private
 */
router.delete('/:id', todoController.deleteTodo);

export default router;