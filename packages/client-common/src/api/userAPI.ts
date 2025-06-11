import { BaseApiClient } from './base.js';
import { User } from '../types/index.js';

// User API class
export class UserAPI extends BaseApiClient {
  async updateProfile(data: { 
    firstName?: string; 
    lastName?: string; 
    password?: string;
  }): Promise<{ status: 'success'; data: { user: User } }> {
    return this.patch('/users/me', data);
  }

  async getCurrentProfile(): Promise<{ status: 'success'; data: { user: User } }> {
    return this.get('/auth/me');
  }
}