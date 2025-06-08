// Todo item types based on backend API

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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Todo {
  id: string;
  name: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  tags: string[];
  dueDate?: string; // ISO date string
  listId: string;
  listName?: string; // Name of the list (populated for global todos view)
  userId: string | User; // Can be just ID or populated user object
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  name: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  dueDate?: string;
  listId: string;
}

export interface UpdateTodoRequest {
  name?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  dueDate?: string;
}

export interface TodosResponse {
  status: 'success';
  data: {
    todos: Todo[];
    total?: number;
    page?: number;
    totalPages?: number;
  };
}

export interface TodoResponse {
  status: 'success';
  data: {
    todo: Todo;
  };
}

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

export interface TodoStats {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}