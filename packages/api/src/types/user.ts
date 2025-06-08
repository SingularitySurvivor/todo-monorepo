import { Document, Types } from 'mongoose';

export interface IUser extends Document<Types.ObjectId> {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserSafe {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface UserRegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: string;
}