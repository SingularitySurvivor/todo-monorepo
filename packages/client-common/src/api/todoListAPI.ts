import { BaseApiClient } from './base.js';
import {
  TodoListsResponse,
  TodoListResponse,
  CreateTodoListPayload,
  UpdateTodoListPayload,
  AddMemberPayload,
  UpdateMemberRolePayload,
  ListQueryParams
} from '../types/index.js';

// Todo List API class
export class TodoListAPI extends BaseApiClient {
  async getLists(params?: ListQueryParams): Promise<TodoListsResponse> {
    return this.get<TodoListsResponse>('/todo-lists', { params });
  }

  async getList(listId: string): Promise<TodoListResponse> {
    return this.get<TodoListResponse>(`/todo-lists/${listId}`);
  }

  async createList(data: CreateTodoListPayload): Promise<TodoListResponse> {
    return this.post<TodoListResponse>('/todo-lists', data);
  }

  async updateList(listId: string, data: UpdateTodoListPayload): Promise<TodoListResponse> {
    return this.patch<TodoListResponse>(`/todo-lists/${listId}`, data);
  }

  async deleteList(listId: string): Promise<void> {
    await this.delete(`/todo-lists/${listId}`);
  }

  async addMember(listId: string, data: AddMemberPayload): Promise<void> {
    await this.post(`/todo-lists/${listId}/members`, data);
  }

  async updateMemberRole(listId: string, data: UpdateMemberRolePayload): Promise<void> {
    await this.patch(`/todo-lists/${listId}/members`, data);
  }

  async removeMember(listId: string, userId: string): Promise<void> {
    await this.delete(`/todo-lists/${listId}/members/${userId}`);
  }

  async archiveList(listId: string, isArchived: boolean): Promise<TodoListResponse> {
    return this.patch<TodoListResponse>(`/todo-lists/${listId}`, { isArchived });
  }
}