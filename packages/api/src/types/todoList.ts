import { Document, Types } from 'mongoose';

export enum ListRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}


export interface ListMember {
  userId: Types.ObjectId;
  role: ListRole;
  joinedAt: Date;
  invitedBy?: Types.ObjectId;
}

export interface ITodoList extends Document<Types.ObjectId> {
  name: string;
  description?: string;
  members: ListMember[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  color?: string;
  icon?: string;
  
  // Instance methods
  getUserRole(userId: string): ListRole | null;
  hasPermission(userId: string, action: 'read' | 'write' | 'delete' | 'manage'): boolean;
  addMember(userId: string, role: ListRole, invitedBy?: string): void;
  removeMember(userId: string): void;
  updateMemberRole(userId: string, newRole: ListRole): void;
}

export interface CreateTodoListDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateTodoListDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isArchived?: boolean;
}

export interface AddMemberDto {
  email: string;
  role: ListRole;
}

export interface UpdateMemberRoleDto {
  userId: string;
  role: ListRole;
}

export interface TodoListFilterDto {
  role?: ListRole;
  archived?: boolean;
}

export interface TodoListQueryDto {
  filter?: TodoListFilterDto;
  sort?: {
    field: 'name' | 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

export interface TodoListWithPermissions {
  id: string;
  name: string;
  description?: string;
  members: ListMember[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  color?: string;
  icon?: string;
  userRole: ListRole;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  todoCount?: number;
  completedCount?: number;
}