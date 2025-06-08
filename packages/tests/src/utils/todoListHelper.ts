import { ApiClient } from './api';
import { TodoList, TodoListResponse } from './types';

export class TodoListHelper {
  static async createTodoList(data: any): Promise<TodoList> {
    const response = await ApiClient.post<TodoListResponse>('/lists', data);
    
    if (response.status !== 'success') {
      throw new Error(`Todo list creation failed: ${JSON.stringify(response)}`);
    }

    return response.data.list;
  }

  static async getTodoList(listId: string): Promise<TodoList> {
    const response = await ApiClient.get<TodoListResponse>(`/lists/${listId}`);
    
    if (response.status !== 'success') {
      throw new Error(`Failed to get todo list: ${JSON.stringify(response)}`);
    }

    return response.data.list;
  }

  static async getTodoLists(): Promise<{ lists: TodoList[], total: number }> {
    const response = await ApiClient.get('/lists');
    
    if (response.status !== 'success') {
      throw new Error(`Failed to get todo lists: ${JSON.stringify(response)}`);
    }

    return response.data;
  }

  static async deleteTodoList(listId: string): Promise<void> {
    await ApiClient.delete(`/lists/${listId}`);
  }

  static async updateTodoList(listId: string, data: any): Promise<TodoList> {
    const response = await ApiClient.patch<TodoListResponse>(`/lists/${listId}`, data);
    
    if (response.status !== 'success') {
      throw new Error(`Failed to update todo list: ${JSON.stringify(response)}`);
    }

    return response.data.list;
  }

  static async addMemberToList(listId: string, email: string, role: 'owner' | 'editor' | 'viewer'): Promise<TodoList> {
    const response = await ApiClient.post<TodoListResponse>(`/lists/${listId}/members`, {
      email,
      role
    });

    if (response.status !== 'success') {
      throw new Error(`Failed to add member: ${JSON.stringify(response)}`);
    }

    return response.data.list;
  }

  static async removeMemberFromList(listId: string, memberId: string): Promise<TodoList> {
    const response = await ApiClient.delete<TodoListResponse>(`/lists/${listId}/members/${memberId}`);

    if (response.status !== 'success') {
      throw new Error(`Failed to remove member: ${JSON.stringify(response)}`);
    }

    return response.data.list;
  }

  static async updateMemberRole(listId: string, userId: string, role: 'owner' | 'editor' | 'viewer'): Promise<TodoList> {
    const response = await ApiClient.patch<TodoListResponse>(`/lists/${listId}/members`, {
      userId,
      role
    });

    if (response.status !== 'success') {
      throw new Error(`Failed to update member role: ${JSON.stringify(response)}`);
    }

    return response.data.list;
  }
}