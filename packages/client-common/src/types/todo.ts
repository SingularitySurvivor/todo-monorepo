import { ApiResponse } from './common.js';
import { User } from './auth.js';

// Todo Types
export enum TodoStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Todo {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  status: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  userId: string | User;
  listId: string;
  listName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoPayload {
  name: string;
  description?: string;
  dueDate?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  listId: string;
}

export interface UpdateTodoPayload {
  name?: string;
  description?: string;
  dueDate?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
}

// Legacy aliases for backward compatibility
export type CreateTodoRequest = CreateTodoPayload;
export type UpdateTodoRequest = UpdateTodoPayload;

// Statistics Types
export interface TodoStats {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

// Query Parameter Types
export interface TodoFilters {
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface TodoQueryParams {
  filters?: TodoFilters;
  sortField?: 'name' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Response Types
export interface TodoResponse extends ApiResponse<{ todo: Todo }> {}
export interface TodosResponse extends ApiResponse<{
  todos: Todo[];
  total: number;
  page: number;
  totalPages: number;
}> {}

export interface TodoStatsResponse extends ApiResponse<{
  stats: TodoStats;
}> {}