// Based on the test files, here are the todo list types from our API

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

export interface CreateTodoListRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateTodoListRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isArchived?: boolean;
}

export interface TodoListsResponse {
  status: 'success';
  data: {
    lists: TodoListWithPermissions[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface TodoListResponse {
  status: 'success';
  data: {
    list: TodoListWithPermissions;
  };
}

export interface AddMemberRequest {
  email: string;
  role: ListRole;
}

export interface UpdateMemberRoleRequest {
  userId: string;
  role: ListRole;
}

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