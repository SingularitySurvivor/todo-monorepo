// Common types used across the application

export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: any[];
}

export interface SSEEvent {
  type: string;
  data: any;
  listId: string;
  userId?: string;
  timestamp: string;
}