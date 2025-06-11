import { ApiResponse } from './common.js';

// Todo List Types
export enum ListRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export interface ListMember {
  userId: string;
  role: ListRole;
  joinedAt: string;
  invitedBy?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface TodoList {
  id: string;
  name: string;
  description?: string;
  visibility: 'private' | 'public';
  members: ListMember[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  color?: string;
  icon?: string;
}

export interface TodoListWithPermissions extends TodoList {
  userRole: ListRole;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  todoCount?: number;
  completedCount?: number;
}

export interface CreateTodoListPayload {
  name: string;
  description?: string;
  visibility?: 'private' | 'public';
  color?: string;
  icon?: string;
}

export interface UpdateTodoListPayload {
  name?: string;
  description?: string;
  visibility?: 'private' | 'public';
  color?: string;
  icon?: string;
  isArchived?: boolean;
}

// Legacy aliases for backward compatibility
export type CreateTodoListRequest = CreateTodoListPayload;
export type UpdateTodoListRequest = UpdateTodoListPayload;

// Member Management Types
export interface AddMemberPayload {
  email: string;
  role: ListRole;
}

export interface UpdateMemberRolePayload {
  userId: string;
  role: ListRole;
}

// Legacy aliases for backward compatibility
export type AddMemberRequest = AddMemberPayload;
export type UpdateMemberRoleRequest = UpdateMemberRolePayload;

// Query Parameter Types
export interface ListFilters {
  role?: ListRole;
  archived?: boolean;
}

export interface ListQueryParams {
  filter?: ListFilters;
  sort?: {
    field: 'name' | 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

// Response Types
export interface TodoListResponse extends ApiResponse<{ list: TodoListWithPermissions }> {}
export interface TodoListsResponse extends ApiResponse<{
  lists: TodoListWithPermissions[];
  total: number;
  page: number;
  totalPages: number;
}> {}