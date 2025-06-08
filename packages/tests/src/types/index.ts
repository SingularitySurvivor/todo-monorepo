// test/types/index.ts - Clean TODO app types without company references

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface RegisterUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  data: {
    user: User;
    token: string;
  };
}

// API Response wrapper
export interface ApiResponse<T> {
  status: string;
  data: T;
}

// Todo List Types
export interface TodoList {
  id: string;
  name: string;
  description?: string;
  visibility: 'private' | 'public';
  members: Array<{
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
    joinedAt: string;
    invitedBy?: string;
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  color?: string;
  icon?: string;
  userRole: 'owner' | 'editor' | 'viewer';
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
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

// Todo Types
export interface Todo {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  userId: string | User;
  listId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoPayload {
  name: string;
  description?: string;
  dueDate?: string;
  status?: 'not_started' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  listId: string;
}

export interface UpdateTodoPayload {
  name?: string;
  description?: string;
  dueDate?: string;
  status?: 'not_started' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

// Pagination Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// Statistics Types
export interface TodoStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

// SSE Types
export interface SSEEvent {
  type: string;
  data: any;
  listId: string;
  userId?: string;
  timestamp: string;
}

// Member Management Types
export interface AddMemberPayload {
  email: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface UpdateMemberRolePayload {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: any[];
}

// Response Types for different endpoints
export interface TodoResponse extends ApiResponse<{ todo: Todo }> {}
export interface TodoListResponse extends ApiResponse<{ list: TodoList }> {}
export interface TodoListsResponse extends ApiResponse<{
  lists: TodoList[];
  total: number;
  page: number;
  totalPages: number;
}> {}
export interface TodosResponse extends ApiResponse<{
  todos: Todo[];
  total: number;
  page: number;
  totalPages: number;
}> {}

export interface TodoStatsResponse extends ApiResponse<{
  stats: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
}> {}

export interface SSEStatusResponse extends ApiResponse<{
  activeClients: number;
  timestamp: string;
}> {}