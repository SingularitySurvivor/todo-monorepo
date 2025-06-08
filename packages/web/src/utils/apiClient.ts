import axios, { AxiosResponse, AxiosError } from 'axios';
import { AuthResponse, ApiError } from '../types/auth';
import {
  TodoListsResponse,
  TodoListResponse,
  CreateTodoListRequest,
  UpdateTodoListRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  ListQueryParams
} from '../types/todoList';
import {
  TodosResponse,
  TodoResponse,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoQueryParams,
  TodoStats
} from '../types/todo';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors consistently
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 errors by clearing auth state
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Return structured error
    const responseData = error.response?.data as any;
    const apiError: ApiError = {
      status: 'error',
      message: responseData?.message || error.message || 'An unexpected error occurred',
      stack: responseData?.stack
    };
    
    return Promise.reject(apiError);
  }
);

// API methods that match our backend endpoints
export const authAPI = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData: any) => {
    const response = await apiClient.patch('/auth/me', userData);
    return response.data;
  },
};

export const todoListAPI = {
  // Get all todo lists for the authenticated user
  getLists: async (params?: ListQueryParams): Promise<TodoListsResponse> => {
    const response = await apiClient.get<TodoListsResponse>('/todo-lists', { params });
    return response.data;
  },

  // Get a specific todo list by ID
  getList: async (listId: string): Promise<TodoListResponse> => {
    const response = await apiClient.get<TodoListResponse>(`/todo-lists/${listId}`);
    return response.data;
  },

  // Create a new todo list
  createList: async (data: CreateTodoListRequest): Promise<TodoListResponse> => {
    const response = await apiClient.post<TodoListResponse>('/todo-lists', data);
    return response.data;
  },

  // Update an existing todo list
  updateList: async (listId: string, data: UpdateTodoListRequest): Promise<TodoListResponse> => {
    const response = await apiClient.patch<TodoListResponse>(`/todo-lists/${listId}`, data);
    return response.data;
  },

  // Delete a todo list
  deleteList: async (listId: string): Promise<void> => {
    await apiClient.delete(`/todo-lists/${listId}`);
  },

  // Add a member to a todo list
  addMember: async (listId: string, data: AddMemberRequest): Promise<void> => {
    await apiClient.post(`/todo-lists/${listId}/members`, data);
  },

  // Update a member's role in a todo list
  updateMemberRole: async (listId: string, data: UpdateMemberRoleRequest): Promise<void> => {
    await apiClient.patch(`/todo-lists/${listId}/members`, data);
  },

  // Remove a member from a todo list
  removeMember: async (listId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/todo-lists/${listId}/members/${userId}`);
  },

  // Archive/unarchive a todo list
  archiveList: async (listId: string, isArchived: boolean): Promise<TodoListResponse> => {
    const response = await apiClient.patch<TodoListResponse>(`/todo-lists/${listId}`, { isArchived });
    return response.data;
  },
};

// Helper function to flatten TodoQueryParams for API calls
const flattenTodoParams = (params?: TodoQueryParams): any => {
  if (!params) return {};
  
  const { filters, ...otherParams } = params;
  
  // Flatten the filters object to match backend expectations
  const flatParams = {
    ...otherParams,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.priority && { priority: filters.priority }),
    ...(filters?.dueDateFrom && { dueDateFrom: filters.dueDateFrom }),
    ...(filters?.dueDateTo && { dueDateTo: filters.dueDateTo }),
    ...(filters?.tags && { tags: filters.tags }),
  };
  
  return flatParams;
};

export const todoAPI = {
  // Get all todos for user across all accessible lists
  getTodos: async (params?: TodoQueryParams): Promise<TodosResponse> => {
    const flatParams = flattenTodoParams(params);
    const response = await apiClient.get<TodosResponse>('/todos', { params: flatParams });
    return response.data;
  },

  // Get todos for a specific list
  getListTodos: async (listId: string, params?: TodoQueryParams): Promise<TodosResponse> => {
    const flatParams = flattenTodoParams(params);
    const response = await apiClient.get<TodosResponse>(`/lists/${listId}/todos`, { params: flatParams });
    return response.data;
  },

  // Get a specific todo by ID
  getTodo: async (todoId: string): Promise<TodoResponse> => {
    const response = await apiClient.get<TodoResponse>(`/todos/${todoId}`);
    return response.data;
  },

  // Create a new todo
  createTodo: async (data: CreateTodoRequest): Promise<TodoResponse> => {
    const response = await apiClient.post<TodoResponse>('/todos', data);
    return response.data;
  },

  // Update an existing todo
  updateTodo: async (todoId: string, data: UpdateTodoRequest): Promise<TodoResponse> => {
    const response = await apiClient.patch<TodoResponse>(`/todos/${todoId}`, data);
    return response.data;
  },

  // Delete a todo
  deleteTodo: async (todoId: string): Promise<void> => {
    await apiClient.delete(`/todos/${todoId}`);
  },

  // Get todo statistics
  getTodoStats: async (): Promise<{ status: 'success'; data: TodoStats }> => {
    const response = await apiClient.get('/todos/stats');
    return response.data;
  },

  // Get todo statistics for a specific list
  getListTodoStats: async (listId: string): Promise<{ status: 'success'; data: TodoStats }> => {
    const response = await apiClient.get(`/lists/${listId}/todos/stats`);
    return response.data;
  },
};

// User API
export const userAPI = {
  // Update current user profile
  updateProfile: async (data: { 
    firstName?: string; 
    lastName?: string; 
    password?: string;
  }): Promise<{ status: 'success'; data: { user: any } }> => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },

  // Get current user profile (via auth endpoint)
  getCurrentProfile: async (): Promise<{ status: 'success'; data: { user: any } }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default apiClient;