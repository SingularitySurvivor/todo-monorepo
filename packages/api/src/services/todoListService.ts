import { Types } from 'mongoose';
import { TodoList, User } from '../models';
import { ApiError, MongoValidator } from '../utils';
import { 
  ITodoList, 
  CreateTodoListDto, 
  UpdateTodoListDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  TodoListQueryDto,
  ListRole,
  TodoListWithPermissions
} from '../types/todoList';

/**
 * Create a new todo list
 */
export const createTodoList = async (
  userId: string,
  listData: CreateTodoListDto
): Promise<TodoListWithPermissions> => {
  MongoValidator.validateObjectIds(userId);

  try {
    const todoList = new TodoList({
      ...listData,
      createdBy: new Types.ObjectId(userId),
    });

    // Note: The pre-save middleware will automatically add the creator as owner
    const savedList = await todoList.save();

    // Populate the necessary fields and return with permissions
    const populatedList = await TodoList.findById(savedList._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email')
      .exec();

    if (!populatedList) {
      throw ApiError.internal('Failed to retrieve created list');
    }

    // Add permissions and role info
    const userRole = populatedList.getUserRole(userId);
    const listObj = populatedList.toObject();
    return {
      id: listObj.id || listObj._id.toString(),
      name: listObj.name,
      description: listObj.description,
      members: listObj.members.map((member: any) => ({
        ...member,
        userId: member.userId._id || member.userId,
        user: member.userId._id ? {
          firstName: member.userId.firstName,
          lastName: member.userId.lastName,
          email: member.userId.email
        } : undefined
      })),
      createdBy: listObj.createdBy._id || listObj.createdBy,
      createdAt: listObj.createdAt,
      updatedAt: listObj.updatedAt,
      isArchived: listObj.isArchived,
      color: listObj.color,
      icon: listObj.icon,
      userRole: userRole!,
      canEdit: populatedList.hasPermission(userId, 'write'),
      canDelete: populatedList.hasPermission(userId, 'delete'),
      canManageMembers: populatedList.hasPermission(userId, 'manage'),
    };
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0] as any;
      throw ApiError.validationError(firstError.message);
    }
    throw error;
  }
};

/**
 * Get todo lists for a user with role-based filtering
 */
export const getTodoListsForUser = async (
  userId: string,
  query: TodoListQueryDto = {}
): Promise<{ lists: TodoListWithPermissions[]; total: number; page: number; totalPages: number }> => {
  MongoValidator.validateObjectIds(userId);

  const { filter = {}, sort, page = 1, limit = 10 } = query;
  
  // Build MongoDB query - user must be a member of the list
  const mongoQuery: any = {
    'members.userId': new Types.ObjectId(userId),
  };
  
  
  if (filter.archived !== undefined) {
    mongoQuery.isArchived = filter.archived;
  }

  // Build sort options
  let sortOptions: any = { createdAt: -1 }; // Default sort
  if (sort) {
    sortOptions = {};
    sortOptions[sort.field] = sort.order === 'asc' ? 1 : -1;
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const [lists, total] = await Promise.all([
    TodoList.find(mongoQuery)
      .populate('createdBy', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec(),
    TodoList.countDocuments(mongoQuery)
  ]);

  // Add permissions and role info to each list
  const listsWithPermissions: TodoListWithPermissions[] = lists.map(list => {
    const userRole = list.getUserRole(userId);
    const listObj = list.toObject();
    return {
      id: listObj.id || listObj._id.toString(),
      name: listObj.name,
      description: listObj.description,
      members: listObj.members.map((member: any) => ({
        ...member,
        userId: member.userId._id || member.userId,
        user: member.userId._id ? {
          firstName: member.userId.firstName,
          lastName: member.userId.lastName,
          email: member.userId.email
        } : undefined
      })),
      createdBy: listObj.createdBy._id || listObj.createdBy,
      createdAt: listObj.createdAt,
      updatedAt: listObj.updatedAt,
      isArchived: listObj.isArchived,
      color: listObj.color,
      icon: listObj.icon,
      userRole: userRole!,
      canEdit: list.hasPermission(userId, 'write'),
      canDelete: list.hasPermission(userId, 'delete'),
      canManageMembers: list.hasPermission(userId, 'manage'),
    };
  });

  // Filter by role if specified
  const filteredLists = filter.role 
    ? listsWithPermissions.filter(list => list.userRole === filter.role)
    : listsWithPermissions;

  const totalFiltered = filteredLists.length;
  
  return {
    lists: filteredLists,
    total: totalFiltered,
    page,
    totalPages: Math.ceil(totalFiltered / limit)
  };
};

/**
 * Get a specific todo list by ID
 */
export const getTodoListById = async (
  userId: string,
  listId: string
): Promise<TodoListWithPermissions> => {
  MongoValidator.validateObjectIds(userId, listId);

  const list = await TodoList.findById(listId)
    .populate('createdBy', 'firstName lastName email')
    .populate('members.userId', 'firstName lastName email')
    .exec();

  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  // Check if user has access to this list
  if (!list.hasPermission(userId, 'read')) {
    throw ApiError.forbidden('You do not have access to this list');
  }

  const userRole = list.getUserRole(userId);
  const listObj = list.toObject();
  return {
    id: listObj.id || listObj._id.toString(),
    name: listObj.name,
    description: listObj.description,
    members: listObj.members.map((member: any) => ({
      ...member,
      userId: member.userId._id || member.userId,
      user: member.userId._id ? {
        firstName: member.userId.firstName,
        lastName: member.userId.lastName,
        email: member.userId.email
      } : undefined
    })),
    createdBy: listObj.createdBy._id || listObj.createdBy,
    createdAt: listObj.createdAt,
    updatedAt: listObj.updatedAt,
    isArchived: listObj.isArchived,
    color: listObj.color,
    icon: listObj.icon,
    userRole: userRole!,
    canEdit: list.hasPermission(userId, 'write'),
    canDelete: list.hasPermission(userId, 'delete'),
    canManageMembers: list.hasPermission(userId, 'manage'),
  };
};

/**
 * Update a todo list
 */
export const updateTodoList = async (
  userId: string,
  listId: string,
  updateData: UpdateTodoListDto
): Promise<TodoListWithPermissions> => {
  MongoValidator.validateObjectIds(userId, listId);

  const list = await TodoList.findById(listId);

  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  // Check permissions
  if (!list.hasPermission(userId, 'write')) {
    throw ApiError.forbidden('You do not have permission to edit this list');
  }

  try {
    // Update fields if provided
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof UpdateTodoListDto] !== undefined) {
        (list as any)[key] = updateData[key as keyof UpdateTodoListDto];
      }
    });

    const savedList = await list.save();

    // Return the list with permissions using getTodoListById
    return await getTodoListById(userId, listId);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0] as any;
      throw ApiError.validationError(firstError.message);
    }
    throw error;
  }
};

/**
 * Delete a todo list
 */
export const deleteTodoList = async (
  userId: string,
  listId: string
): Promise<void> => {
  MongoValidator.validateObjectIds(userId, listId);

  const list = await TodoList.findById(listId);

  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  // Check permissions - only owners can delete
  if (!list.hasPermission(userId, 'delete')) {
    throw ApiError.forbidden('You do not have permission to delete this list');
  }

  await TodoList.findByIdAndDelete(listId);
};

/**
 * Add a member to a todo list
 */
export const addMemberToList = async (
  userId: string,
  listId: string,
  memberData: AddMemberDto
): Promise<TodoListWithPermissions> => {
  MongoValidator.validateObjectIds(userId, listId);

  const list = await TodoList.findById(listId);

  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  // Check permissions - only owners can manage members
  if (!list.hasPermission(userId, 'manage')) {
    throw ApiError.forbidden('You do not have permission to manage members of this list');
  }

  // Find user by email
  const userToAdd = await User.findOne({ email: memberData.email.toLowerCase() });
  if (!userToAdd) {
    throw ApiError.notFound('User not found with this email');
  }

  // Check if user is already a member
  const existingMember = list.members.find(
    member => member.userId.toString() === userToAdd._id.toString()
  );

  if (existingMember) {
    throw ApiError.badRequest('User is already a member of this list');
  }

  // Add member
  list.addMember(userToAdd._id.toString(), memberData.role, userId);
  await list.save();

  // Return the list with permissions using getTodoListById
  return await getTodoListById(userId, listId);
};

/**
 * Remove a member from a todo list
 */
export const removeMemberFromList = async (
  userId: string,
  listId: string,
  memberUserId: string
): Promise<TodoListWithPermissions> => {
  MongoValidator.validateObjectIds(userId, listId, memberUserId);

  const list = await TodoList.findById(listId);

  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  // Check permissions - only owners can manage members
  if (!list.hasPermission(userId, 'manage')) {
    throw ApiError.forbidden('You do not have permission to manage members of this list');
  }

  // Cannot remove the creator/owner
  if (memberUserId === list.createdBy.toString()) {
    throw ApiError.badRequest('Cannot remove the list creator');
  }

  // Check if member exists
  const memberExists = list.members.some(
    member => member.userId.toString() === memberUserId
  );

  if (!memberExists) {
    throw ApiError.notFound('Member not found in this list');
  }

  list.removeMember(memberUserId);
  await list.save();

  // Return the list with permissions using getTodoListById
  return await getTodoListById(userId, listId);
};

/**
 * Update member role in a todo list
 */
export const updateMemberRole = async (
  userId: string,
  listId: string,
  memberData: UpdateMemberRoleDto
): Promise<TodoListWithPermissions> => {
  MongoValidator.validateObjectIds(userId, listId, memberData.userId);

  const list = await TodoList.findById(listId);

  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  // Check permissions - only owners can manage members
  if (!list.hasPermission(userId, 'manage')) {
    throw ApiError.forbidden('You do not have permission to manage members of this list');
  }

  // Cannot change the creator's role from owner
  if (memberData.userId === list.createdBy.toString() && memberData.role !== ListRole.OWNER) {
    throw ApiError.badRequest('Cannot change the list creator\'s role from owner');
  }

  // Check if member exists
  const memberExists = list.members.some(
    member => member.userId.toString() === memberData.userId
  );

  if (!memberExists) {
    throw ApiError.notFound('Member not found in this list');
  }

  list.updateMemberRole(memberData.userId, memberData.role);
  await list.save();

  // Return the list with permissions using getTodoListById
  return await getTodoListById(userId, listId);
};

/**
 * Leave a todo list (remove yourself from the list)
 */
export const leaveList = async (
  userId: string,
  listId: string
): Promise<void> => {
  MongoValidator.validateObjectIds(userId, listId);

  const list = await TodoList.findById(listId);

  if (!list) {
    throw ApiError.notFound('Todo list not found');
  }

  // Check if user is a member
  if (!list.hasPermission(userId, 'read')) {
    throw ApiError.forbidden('You are not a member of this list');
  }

  // Cannot leave if you're the only owner
  const owners = list.members.filter(member => member.role === ListRole.OWNER);
  const userRole = list.getUserRole(userId);
  
  if (userRole === ListRole.OWNER && owners.length === 1) {
    throw ApiError.badRequest('Cannot leave the list as you are the only owner. Please transfer ownership or delete the list.');
  }

  list.removeMember(userId);
  await list.save();
};