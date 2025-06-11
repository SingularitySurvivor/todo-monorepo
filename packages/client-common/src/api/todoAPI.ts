import { BaseApiClient } from './base.js';
import {
  TodosResponse,
  TodoResponse,
  CreateTodoPayload,
  UpdateTodoPayload,
  TodoQueryParams,
  TodoStats
} from '../types/index.js';
import { flattenTodoParams } from '../utils/index.js';

// Todo API class
export class TodoAPI extends BaseApiClient {
  async getTodos(params?: TodoQueryParams): Promise<TodosResponse> {
    const flatParams = flattenTodoParams(params);
    return this.get<TodosResponse>('/todos', { params: flatParams });
  }

  async getListTodos(listId: string, params?: TodoQueryParams): Promise<TodosResponse> {
    const flatParams = flattenTodoParams(params);
    return this.get<TodosResponse>(`/lists/${listId}/todos`, { params: flatParams });
  }

  async getTodo(todoId: string): Promise<TodoResponse> {
    return this.get<TodoResponse>(`/todos/${todoId}`);
  }

  async createTodo(data: CreateTodoPayload): Promise<TodoResponse> {
    return this.post<TodoResponse>('/todos', data);
  }

  async updateTodo(todoId: string, data: UpdateTodoPayload): Promise<TodoResponse> {
    return this.patch<TodoResponse>(`/todos/${todoId}`, data);
  }

  async deleteTodo(todoId: string): Promise<void> {
    await this.delete(`/todos/${todoId}`);
  }

  async getTodoStats(): Promise<{ status: 'success'; data: TodoStats }> {
    return this.get('/todos/stats');
  }

  async getListTodoStats(listId: string): Promise<{ status: 'success'; data: TodoStats }> {
    return this.get(`/lists/${listId}/todos/stats`);
  }
}