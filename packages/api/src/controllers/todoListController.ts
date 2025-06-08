import { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { todoListService } from '../services';
import { asyncHandler, ApiError } from '../utils';
import { AuthRequest } from '../middlewares/auth';
import { ListRole } from '../types/todoList';
import { broadcastListUpdated, broadcastListDeleted, broadcastMemberAdded, broadcastMemberRemoved, broadcastMemberRoleChanged } from '../services/sseService';

/**
 * Validation rules for creating a todo list
 */
export const createTodoListValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('List name is required')
    .isLength({ max: 100 })
    .withMessage('List name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
];

/**
 * Validation rules for updating a todo list
 */
export const updateTodoListValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid list ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('List name cannot be empty if provided')
    .isLength({ max: 100 })
    .withMessage('List name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean value'),
];

/**
 * Validation rules for member management
 */
export const addMemberValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid list ID'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .isIn(Object.values(ListRole))
    .withMessage(`Role must be one of: ${Object.values(ListRole).join(', ')}`),
];

export const updateMemberRoleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid list ID'),
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .isIn(Object.values(ListRole))
    .withMessage(`Role must be one of: ${Object.values(ListRole).join(', ')}`),
];

/**
 * Validation rules for getting todo lists
 */
export const getTodoListsValidation = [
  query('role')
    .optional()
    .isIn(Object.values(ListRole))
    .withMessage(`Role must be one of: ${Object.values(ListRole).join(', ')}`),
  query('archived')
    .optional()
    .isBoolean()
    .withMessage('Archived must be a boolean value'),
  query('sortField')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt'])
    .withMessage('Sort field must be one of: name, createdAt, updatedAt'),
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
 * Create a new todo list
 */
export const createTodoList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const userId = req.user.id;
  const listData = req.body;

  const todoList = await todoListService.createTodoList(userId, listData);

  res.status(201).json({
    status: 'success',
    data: {
      list: todoList,
    },
  });
});

/**
 * Get all todo lists for the current user
 */
export const getTodoLists = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const userId = req.user.id;
  const {
    role,
    archived,
    sortField = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  const query = {
    filter: {
      ...(role && { role: role as ListRole }),
      ...(archived !== undefined && { archived: archived === 'true' }),
    },
    sort: {
      field: sortField as any,
      order: sortOrder as 'asc' | 'desc',
    },
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  };

  const result = await todoListService.getTodoListsForUser(userId, query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

/**
 * Get a specific todo list by ID
 */
export const getTodoList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const todoList = await todoListService.getTodoListById(userId, id);

  res.status(200).json({
    status: 'success',
    data: {
      list: todoList,
    },
  });
});

/**
 * Update a todo list
 */
export const updateTodoList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const { id } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  const todoList = await todoListService.updateTodoList(userId, id, updateData);

  // Broadcast the update to all list members
  broadcastListUpdated(id, todoList, userId);

  res.status(200).json({
    status: 'success',
    data: {
      list: todoList,
    },
  });
});

/**
 * Delete a todo list
 */
export const deleteTodoList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Get the list data and member list before deletion for broadcasting
  const todoList = await todoListService.getTodoListById(userId, id);
  
  // Extract member user IDs for broadcasting since the list will be deleted
  const memberUserIds = todoList.members.map(member => {
    if (typeof member.userId === 'object' && member.userId._id) {
      return member.userId._id.toString();
    }
    return member.userId.toString();
  });

  await todoListService.deleteTodoList(userId, id);

  // Broadcast the deletion to all list members with the preserved member list
  broadcastListDeleted(id, { name: todoList.name, id: todoList.id, memberUserIds }, userId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Add a member to a todo list
 */
export const addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const { id } = req.params;
  const userId = req.user.id;
  const memberData = req.body;

  const todoList = await todoListService.addMemberToList(userId, id, memberData);

  // Find the newly added member for broadcasting
  const newMember = todoList.members.find(member => 
    member.userId && 
    todoList.members.filter(m => m.userId?.toString() === member.userId?.toString()).length === 1
  );

  if (newMember) {
    broadcastMemberAdded(id, newMember, userId);
  }

  res.status(200).json({
    status: 'success',
    data: {
      list: todoList,
    },
  });
});

/**
 * Remove a member from a todo list
 */
export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, memberId } = req.params;
  const userId = req.user.id;

  const todoList = await todoListService.removeMemberFromList(userId, id, memberId);

  // Broadcast the member removal
  broadcastMemberRemoved(id, memberId, userId);

  res.status(200).json({
    status: 'success',
    data: {
      list: todoList,
    },
  });
});

/**
 * Update a member's role
 */
export const updateMemberRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.validationError(errors.array()[0].msg);
  }

  const { id } = req.params;
  const userId = req.user.id;
  const memberData = req.body;

  const todoList = await todoListService.updateMemberRole(userId, id, memberData);

  // Broadcast the role change
  broadcastMemberRoleChanged(id, memberData, userId);

  res.status(200).json({
    status: 'success',
    data: {
      list: todoList,
    },
  });
});

/**
 * Leave a todo list
 */
export const leaveList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  await todoListService.leaveList(userId, id);

  // Broadcast that the user left
  broadcastMemberRemoved(id, userId, userId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});