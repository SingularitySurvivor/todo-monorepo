import { Document, Types } from 'mongoose';

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

export interface ITodo extends Document<Types.ObjectId> {
  name: string;
  description?: string;
  dueDate?: Date;
  status: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  userId: Types.ObjectId;
  listId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoDto {
  name: string;
  description?: string;
  dueDate?: Date;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  listId: string;
}

export interface UpdateTodoDto {
  name?: string;
  description?: string;
  dueDate?: Date;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
}

export interface TodoFilterDto {
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  tags?: string[];
}

export interface TodoSortOptions {
  field: 'name' | 'dueDate' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

export interface TodoQueryDto {
  filter?: TodoFilterDto;
  sort?: TodoSortOptions;
  page?: number;
  limit?: number;
}