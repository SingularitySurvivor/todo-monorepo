import { Types } from 'mongoose';
import { Todo, TodoList } from '../models';
import { ApiError, MongoValidator } from '../utils';
import { 
  ITodo, 
  CreateTodoDto, 
  UpdateTodoDto, 
  TodoQueryDto, 
  TodoFilterDto,
  TodoSortOptions 
} from '../types/todo';

/**
 * Create a new todo
 */
export const createTodo = async (
  userId: string,
  todoData: CreateTodoDto
): Promise<ITodo> => {
  MongoValidator.validateObjectIds(userId, todoData.listId);

  // Check if user has permission to write to this list
  const list = await TodoList.findById(todoData.listId);
  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  if (!list.hasPermission(userId, 'write')) {
    throw ApiError.forbidden('You do not have permission to add todos to this list');
  }

  try {
    const todo = new Todo({
      ...todoData,
      userId: new Types.ObjectId(userId),
      listId: new Types.ObjectId(todoData.listId),
    });

    return await todo.save();
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0] as any;
      throw ApiError.validationError(firstError.message);
    }
    throw error;
  }
};

/**
 * Get todos by list ID with filtering and sorting
 */
export const getTodosByListId = async (
  userId: string,
  listId: string,
  query: TodoQueryDto = {}
): Promise<{ todos: ITodo[]; total: number; page: number; totalPages: number }> => {
  MongoValidator.validateObjectIds(userId, listId);

  // Check if user has permission to read from this list
  const list = await TodoList.findById(listId);
  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  if (!list.hasPermission(userId, 'read')) {
    throw ApiError.forbidden('You do not have permission to view todos in this list');
  }

  const { filter = {}, sort, page = 1, limit = 10 } = query;
  
  // Build MongoDB query
  const mongoQuery: any = { listId: new Types.ObjectId(listId) };
  
  // Apply filters
  if (filter.status) {
    mongoQuery.status = filter.status;
  }
  
  if (filter.priority) {
    mongoQuery.priority = filter.priority;
  }
  
  if (filter.dueDateFrom || filter.dueDateTo) {
    mongoQuery.dueDate = {};
    if (filter.dueDateFrom) {
      mongoQuery.dueDate.$gte = filter.dueDateFrom;
    }
    if (filter.dueDateTo) {
      mongoQuery.dueDate.$lte = filter.dueDateTo;
    }
  }
  
  if (filter.tags && filter.tags.length > 0) {
    mongoQuery.tags = { $in: filter.tags };
  }

  // Build sort options
  let sortOptions: any = { createdAt: -1 }; // Default sort
  if (sort) {
    sortOptions = {};
    sortOptions[sort.field] = sort.order === 'asc' ? 1 : -1;
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [todos, total] = await Promise.all([
    Todo.find(mongoQuery)
      .populate('userId', 'firstName lastName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec(),
    Todo.countDocuments(mongoQuery)
  ]);

  return {
    todos,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Get todos across all lists accessible to a user
 */
export const getTodosByUserId = async (
  userId: string,
  query: TodoQueryDto = {}
): Promise<{ todos: ITodo[]; total: number; page: number; totalPages: number }> => {
  MongoValidator.validateObjectIds(userId);

  // Get all lists the user has access to
  const accessibleLists = await TodoList.find(
    { 'members.userId': new Types.ObjectId(userId) },
    { _id: 1 }
  );

  const listIds = accessibleLists.map(list => list._id);

  const { filter = {}, sort, page = 1, limit = 10 } = query;
  
  // Build MongoDB query - todos from accessible lists
  const mongoQuery: any = { listId: { $in: listIds } };
  
  // Apply filters
  if (filter.status) {
    mongoQuery.status = filter.status;
  }
  
  if (filter.priority) {
    mongoQuery.priority = filter.priority;
  }
  
  if (filter.dueDateFrom || filter.dueDateTo) {
    mongoQuery.dueDate = {};
    if (filter.dueDateFrom) {
      mongoQuery.dueDate.$gte = filter.dueDateFrom;
    }
    if (filter.dueDateTo) {
      mongoQuery.dueDate.$lte = filter.dueDateTo;
    }
  }
  
  if (filter.tags && filter.tags.length > 0) {
    mongoQuery.tags = { $in: filter.tags };
  }

  // Build sort options
  let sortOptions: any = { createdAt: -1 }; // Default sort
  if (sort) {
    sortOptions = {};
    sortOptions[sort.field] = sort.order === 'asc' ? 1 : -1;
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [todos, total] = await Promise.all([
    Todo.find(mongoQuery)
      .populate('userId', 'firstName lastName email')
      .populate('listId', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec(),
    Todo.countDocuments(mongoQuery)
  ]);

  return {
    todos,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Get todo by ID (ensuring user has access to the list)
 */
export const getTodoById = async (
  userId: string,
  todoId: string
): Promise<ITodo> => {
  MongoValidator.validateObjectIds(userId, todoId);

  const todo = await Todo.findById(todoId)
    .populate('userId', 'firstName lastName email')
    .populate('listId', 'name');

  if (!todo) {
    throw ApiError.notFound('Todo not found');
  }

  // Check if user has permission to read from this list
  const list = await TodoList.findById(todo.listId);
  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  if (!list.hasPermission(userId, 'read')) {
    throw ApiError.forbidden('You do not have permission to view this todo');
  }

  return todo;
};

/**
 * Update todo
 */
export const updateTodo = async (
  userId: string,
  todoId: string,
  updateData: UpdateTodoDto
): Promise<ITodo> => {
  MongoValidator.validateObjectIds(userId, todoId);

  const todo = await Todo.findById(todoId);

  if (!todo) {
    throw ApiError.notFound('Todo not found');
  }

  // Check if user has permission to write to this list
  const list = await TodoList.findById(todo.listId);
  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  if (!list.hasPermission(userId, 'write')) {
    throw ApiError.forbidden('You do not have permission to edit todos in this list');
  }

  try {
    // Update fields if provided
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof UpdateTodoDto] !== undefined) {
        (todo as any)[key] = updateData[key as keyof UpdateTodoDto];
      }
    });

    return await todo.save();
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0] as any;
      throw ApiError.validationError(firstError.message);
    }
    throw error;
  }
};

/**
 * Delete todo
 */
export const deleteTodo = async (
  userId: string,
  todoId: string
): Promise<void> => {
  MongoValidator.validateObjectIds(userId, todoId);

  const todo = await Todo.findById(todoId);

  if (!todo) {
    throw ApiError.notFound('Todo not found');
  }

  // Check if user has permission to write to this list
  const list = await TodoList.findById(todo.listId);
  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  if (!list.hasPermission(userId, 'write')) {
    throw ApiError.forbidden('You do not have permission to delete todos in this list');
  }

  await Todo.findByIdAndDelete(todoId);
};

/**
 * Get todo statistics for a specific list
 */
export const getTodoStatsForList = async (userId: string, listId: string) => {
  MongoValidator.validateObjectIds(userId, listId);

  // Check if user has permission to read from this list
  const list = await TodoList.findById(listId);
  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  if (!list.hasPermission(userId, 'read')) {
    throw ApiError.forbidden('You do not have permission to view stats for this list');
  }

  const listObjectId = new Types.ObjectId(listId);
  
  const [statusStats, priorityStats, totalCount] = await Promise.all([
    Todo.aggregate([
      { $match: { listId: listObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Todo.aggregate([
      { $match: { listId: listObjectId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    Todo.countDocuments({ listId: listObjectId })
  ]);

  return {
    total: totalCount,
    byStatus: statusStats.reduce((acc: any, stat: any) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    byPriority: priorityStats.reduce((acc: any, stat: any) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {})
  };
};

/**
 * Get todo statistics across all accessible lists for a user
 */
export const getTodoStats = async (userId: string) => {
  MongoValidator.validateObjectIds(userId);

  // Get all lists the user has access to
  const accessibleLists = await TodoList.find(
    { 'members.userId': new Types.ObjectId(userId) },
    { _id: 1 }
  );

  const listIds = accessibleLists.map(list => list._id);
  
  const [statusStats, priorityStats, totalCount] = await Promise.all([
    Todo.aggregate([
      { $match: { listId: { $in: listIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Todo.aggregate([
      { $match: { listId: { $in: listIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    Todo.countDocuments({ listId: { $in: listIds } })
  ]);

  return {
    total: totalCount,
    byStatus: statusStats.reduce((acc: any, stat: any) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    byPriority: priorityStats.reduce((acc: any, stat: any) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {})
  };
};