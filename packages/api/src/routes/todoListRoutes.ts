import express from 'express';
import { todoListController, todoController } from '../controllers';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/todo-lists
 * @desc    Create a new todo list
 * @access  Private
 */
router.post(
  '/',
  todoListController.createTodoListValidation,
  todoListController.createTodoList
);

/**
 * @route   GET /api/todo-lists
 * @desc    Get all todo lists for the current user
 * @access  Private
 */
router.get(
  '/',
  todoListController.getTodoListsValidation,
  todoListController.getTodoLists
);

/**
 * @route   GET /api/todo-lists/:id
 * @desc    Get a specific todo list by ID
 * @access  Private
 */
router.get('/:id', todoListController.getTodoList);

/**
 * @route   PATCH /api/todo-lists/:id
 * @desc    Update a todo list
 * @access  Private
 */
router.patch(
  '/:id',
  todoListController.updateTodoListValidation,
  todoListController.updateTodoList
);

/**
 * @route   DELETE /api/todo-lists/:id
 * @desc    Delete a todo list
 * @access  Private
 */
router.delete('/:id', todoListController.deleteTodoList);

/**
 * @route   POST /api/todo-lists/:id/members
 * @desc    Add a member to a todo list
 * @access  Private
 */
router.post(
  '/:id/members',
  todoListController.addMemberValidation,
  todoListController.addMember
);

/**
 * @route   DELETE /api/todo-lists/:id/members/:memberId
 * @desc    Remove a member from a todo list
 * @access  Private
 */
router.delete('/:id/members/:memberId', todoListController.removeMember);

/**
 * @route   PATCH /api/todo-lists/:id/members
 * @desc    Update a member's role
 * @access  Private
 */
router.patch(
  '/:id/members',
  todoListController.updateMemberRoleValidation,
  todoListController.updateMemberRole
);

/**
 * @route   POST /api/todo-lists/:id/leave
 * @desc    Leave a todo list
 * @access  Private
 */
router.post('/:id/leave', todoListController.leaveList);

/**
 * @route   GET /api/todo-lists/:listId/todos
 * @desc    Get all todos for a specific list
 * @access  Private
 */
router.get(
  '/:listId/todos',
  todoController.getTodosValidation,
  todoController.getTodosByList
);

/**
 * @route   GET /api/todo-lists/:listId/todos/stats
 * @desc    Get todo statistics for a specific list
 * @access  Private
 */
router.get('/:listId/todos/stats', todoController.getTodoStatsForList);

export default router;