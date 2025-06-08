export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthenticatedTestUser extends TestUser {
  user: User;
  token: string;
}

export interface TodoList {
  id: string;
  name: string;
  description?: string;
  members: Array<{
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
    joinedAt: string;
    invitedBy?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
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

export interface Todo {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  userId: string;
  listId: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: string;
  data: T;
}

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

// Import User type from the main types
import { User, LoginResponse, RegisterUserPayload } from '../types';
export { User, LoginResponse, RegisterUserPayload };