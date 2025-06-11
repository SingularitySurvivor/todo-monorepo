import { User } from '@todo-app/client-common';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthenticatedTestUser extends TestUser {
  user: User;
  token: string;
}

export interface RegisterUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  status: 'success';
  data: {
    user: User;
    token: string;
  };
}