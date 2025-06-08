import { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { todoService } from '../services';
import { asyncHandler, ApiError } from '../utils';
import { AuthRequest } from '../middlewares/auth';
import { TodoStatus, TodoPriority } from '../types/todo';
import { broadcastTodoCreated, broadcastTodoUpdated, broadcastTodoDeleted } from '../services/sseService';

/**
 * Validation rules for creating a todo
 */
export const createTodoValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Todo name is required')
    .isLength({ max: 200 })
    .withMessage('Todo name cannot exceed 200 characters'),
  body('listId')
    .isMongoId()
    .withMessage('Valid list ID is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(Object.values(TodoStatus))
    .withMessage(`Status must be one of: ${Object.values(TodoStatus).join(', ')}`),
  body('priority')
    .optional()
    .isIn(Object.values(TodoPriority))
    .withMessage(`Priority must be one of: ${Object.values(TodoPriority).join(', ')}`),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.some((tag: string) => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with maximum 50 characters');
      }
      return true;
    }),
];

/**
 * Validation rules for updating a todo
 */
export const updateTodoValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid todo ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Todo name cannot be empty if provided')
    .isLength({ max: 200 })
    .withMessage('Todo name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(Object.values(TodoStatus))
    .withMessage(`Status must be one of: ${Object.values(TodoStatus).join(', ')}`),
  body('priority')
    .optional()
    .isIn(Object.values(TodoPriority))
    .withMessage(`Priority must be one of: ${Object.values(TodoPriority).join(', ')}`),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.some((tag: string) => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with maximum 50 characters');
      }
      return true;
    }),
];

/**
 * Validation rules for getting todos with query parameters
 */
export const getTodosValidation = [
  query('status')
    .optional()
    .isIn(Object.values(TodoStatus))
    .withMessage(`Status must be one of: ${Object.values(TodoStatus).join(', ')}`),
  query('priority')
    .optional()
    .isIn(Object.values(TodoPriority))
    .withMessage(`Priority must be one of: ${Object.values(TodoPriority).join(', ')}`),
  query('dueDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Due date from must be a valid date'),
  query('dueDateTo')
    .optional()
    .isISO8601()
    .withMessage('Due date to must be a valid date'),
  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return true; // Single tag
      }
      if (Array.isArray(value) && value.every(tag => typeof tag === 'string')) {
        return true; // Multiple tags
      }
      throw new Error('Tags must be a string or array of strings');
    }),
  query('sortField')
    .optional()
    .isIn(['name', 'dueDate', 'status', 'priority', 'createdAt', 'updatedAt'])
    .withMessage('Sort field must be one of: name, dueDate, status, priority, createdAt, updatedAt'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * Create a new todo
 */
export const createTodo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const userId = req.user.id;
  const todoData = req.body;

  const todo = await todoService.createTodo(userId, todoData);

  // Broadcast the new todo to all list members
  console.log(`Broadcasting todo creation: listId=${todoData.listId}, todoId=${todo.id}, userId=${userId}`);
  await broadcastTodoCreated(todoData.listId, todo, userId);

  res.status(201).json({
    status: 'success',
    data: {
      todo,
    },
  });
});

/**
 * Get todos by list ID
 */
export const getTodosByList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const userId = req.user.id;
  const { listId } = req.params;
  const {
    status,
    priority,
    dueDateFrom,
    dueDateTo,
    tags,
    sortField = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  // Build query object
  const query = {
    filter: {
      ...(status && { status: status as TodoStatus }),
      ...(priority && { priority: priority as TodoPriority }),
      ...(dueDateFrom && { dueDateFrom: new Date(dueDateFrom as string) }),
      ...(dueDateTo && { dueDateTo: new Date(dueDateTo as string) }),
      ...(tags && { 
        tags: Array.isArray(tags) ? tags as string[] : [tags as string] 
      }),
    },
    sort: {
      field: sortField as any,
      order: sortOrder as 'asc' | 'desc',
    },
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  };

  const result = await todoService.getTodosByListId(userId, listId, query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

/**
 * Get all todos across all accessible lists for the current user
 */
export const getTodos = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const userId = req.user.id;
  const {
    status,
    priority,
    dueDateFrom,
    dueDateTo,
    tags,
    sortField = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  // Build query object
  const query = {
    filter: {
      ...(status && { status: status as TodoStatus }),
      ...(priority && { priority: priority as TodoPriority }),
      ...(dueDateFrom && { dueDateFrom: new Date(dueDateFrom as string) }),
      ...(dueDateTo && { dueDateTo: new Date(dueDateTo as string) }),
      ...(tags && { 
        tags: Array.isArray(tags) ? tags as string[] : [tags as string] 
      }),
    },
    sort: {
      field: sortField as any,
      order: sortOrder as 'asc' | 'desc',
    },
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  };

  const result = await todoService.getTodosByUserId(userId, query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

/**
 * Get a specific todo by ID
 */
export const getTodo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const todo = await todoService.getTodoById(userId, id);

  res.status(200).json({
    status: 'success',
    data: {
      todo,
    },
  });
});

/**
 * Update a todo
 */
export const updateTodo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const { id } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  const todo = await todoService.updateTodo(userId, id, updateData);

  // Broadcast the updated todo to all list members
  await broadcastTodoUpdated(todo.listId.toString(), todo, userId);

  res.status(200).json({
    status: 'success',
    data: {
      todo,
    },
  });
});

/**
 * Delete a todo
 */
export const deleteTodo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Get the todo first to access the listId for broadcasting
  const todo = await todoService.getTodoById(userId, id);
  
  // Extract listId properly - handle both populated and non-populated cases
  let listId: string;
  if (typeof todo.listId === 'object' && todo.listId._id) {
    listId = todo.listId._id.toString();
  } else {
    listId = todo.listId.toString();
  }

  await todoService.deleteTodo(userId, id);

  // Broadcast the deletion to all list members
  broadcastTodoDeleted(listId, id, userId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Get todo statistics for a specific list
 */
export const getTodoStatsForList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { listId } = req.params;

  const stats = await todoService.getTodoStatsForList(userId, listId);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

/**
 * Get todo statistics across all accessible lists for the current user
 */
export const getTodoStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  const stats = await todoService.getTodoStats(userId);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});