import { todoListAPI } from './api';
import { TodoListWithPermissions as TodoList, ListRole } from '@todo-app/client-common';

export class TodoListHelper {
  static async createTodoList(data: any): Promise<TodoList> {
    const response = await todoListAPI.createList(data);
    
    if (response.status !== 'success') {
      throw new Error(`Todo list creation failed: ${JSON.stringify(response)}`);
    }

    return response.data.list;
  }

  static async getTodoList(listId: string): Promise<TodoList> {
    const response = await todoListAPI.getList(listId);
    
    if (response.status !== 'success') {
      throw new Error(`Failed to get todo list: ${JSON.stringify(response)}`);
    }

    return response.data.list;
  }

  static async getTodoLists(): Promise<{ lists: TodoList[], total: number }> {
    const response = await todoListAPI.getLists();
    
    if (response.status !== 'success') {
      throw new Error(`Failed to get todo lists: ${JSON.stringify(response)}`);
    }

    return response.data;
  }

  static async deleteTodoList(listId: string): Promise<void> {
    await todoListAPI.deleteList(listId);
  }

  static async updateTodoList(listId: string, data: any): Promise<TodoList> {
    const response = await todoListAPI.updateList(listId, data);
    
    if (response.status !== 'success') {
      throw new Error(`Failed to update todo list: ${JSON.stringify(response)}`);
    }

    return response.data.list;
  }

  static async addMemberToList(listId: string, email: string, role: ListRole): Promise<void> {
    await todoListAPI.addMember(listId, { email, role });
  }

  static async removeMemberFromList(listId: string, memberId: string): Promise<void> {
    await todoListAPI.removeMember(listId, memberId);
  }

  static async updateMemberRole(listId: string, userId: string, role: ListRole): Promise<void> {
    await todoListAPI.updateMemberRole(listId, { userId, role });
  }
}