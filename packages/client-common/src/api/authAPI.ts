import { BaseApiClient } from './base.js';
import { AuthResponse, User } from '../types/index.js';

// Auth API class
export class AuthAPI extends BaseApiClient {
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', userData);
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  async updateProfile(userData: any) {
    return this.patch('/auth/me', userData);
  }
}