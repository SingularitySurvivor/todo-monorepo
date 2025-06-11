import { todoAPI } from './api';
import { Todo } from '@todo-app/client-common';

export class TodoHelper {
  static async createTodo(data: any): Promise<Todo> {
    const response = await todoAPI.createTodo(data);
    
    if (response.status !== 'success') {
      throw new Error(`Todo creation failed: ${JSON.stringify(response)}`);
    }

    return response.data.todo;
  }

  static async getTodo(todoId: string): Promise<Todo> {
    const response = await todoAPI.getTodo(todoId);
    
    if (response.status !== 'success') {
      throw new Error(`Failed to get todo: ${JSON.stringify(response)}`);
    }

    return response.data.todo;
  }

  static async updateTodo(todoId: string, data: any): Promise<Todo> {
    const response = await todoAPI.updateTodo(todoId, data);
    
    if (response.status !== 'success') {
      throw new Error(`Failed to update todo: ${JSON.stringify(response)}`);
    }

    return response.data.todo;
  }

  static async deleteTodo(todoId: string): Promise<void> {
    await todoAPI.deleteTodo(todoId);
  }
}