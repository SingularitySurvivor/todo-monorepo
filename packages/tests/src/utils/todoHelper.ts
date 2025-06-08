import { ApiClient } from './api';
import { Todo, TodoResponse } from './types';

export class TodoHelper {
  static async createTodo(data: any): Promise<Todo> {
    const response = await ApiClient.post<TodoResponse>('/todos', data);
    
    if (response.status !== 'success') {
      throw new Error(`Todo creation failed: ${JSON.stringify(response)}`);
    }

    return response.data.todo;
  }

  static async getTodo(todoId: string): Promise<Todo> {
    const response = await ApiClient.get<TodoResponse>(`/todos/${todoId}`);
    
    if (response.status !== 'success') {
      throw new Error(`Failed to get todo: ${JSON.stringify(response)}`);
    }

    return response.data.todo;
  }

  static async updateTodo(todoId: string, data: any): Promise<Todo> {
    const response = await ApiClient.patch<TodoResponse>(`/todos/${todoId}`, data);
    
    if (response.status !== 'success') {
      throw new Error(`Failed to update todo: ${JSON.stringify(response)}`);
    }

    return response.data.todo;
  }

  static async deleteTodo(todoId: string): Promise<void> {
    await ApiClient.delete(`/todos/${todoId}`);
  }
}