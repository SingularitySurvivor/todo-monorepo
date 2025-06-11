// test/utils/api.ts
import dotenv from 'dotenv';
import { createApiClients } from '@todo-app/client-common';

// Load environment variables
dotenv.config();

// Create API clients with test environment configuration
const apiClients = createApiClients(process.env.API_BASE_URL || 'http://localhost:3000/api');

// Export the API clients for use in tests
export const { auth: authAPI, todoList: todoListAPI, todo: todoAPI, user: userAPI } = apiClients;

// Export the client management functions
export const ApiClient = {
  setBaseURL: (url: string) => {
    // Note: This would require updating the base client implementation
    // For now, create new clients with the new base URL
    const newClients = createApiClients(url);
    Object.assign(apiClients, newClients);
  },
  
  setAuthToken: (token: string) => {
    authAPI.setAuthToken(token);
    todoListAPI.setAuthToken(token);
    todoAPI.setAuthToken(token);
    userAPI.setAuthToken(token);
  },
  
  getAuthToken: () => {
    return authAPI.getAuthToken();
  },
  
  clearAuthToken: () => {
    authAPI.clearAuthToken();
    todoListAPI.clearAuthToken();
    todoAPI.clearAuthToken();
    userAPI.clearAuthToken();
  },

  // Legacy HTTP methods for backward compatibility
  get: <T = any>(url: string, config?: any): Promise<T> => {
    return authAPI.get<T>(url, config);
  },
  
  post: <T = any>(url: string, data: any = {}, config?: any): Promise<T> => {
    return authAPI.post<T>(url, data, config);
  },
  
  put: <T = any>(url: string, data: any = {}, config?: any): Promise<T> => {
    return authAPI.put<T>(url, data, config);
  },
  
  patch: <T = any>(url: string, data: any = {}, config?: any): Promise<T> => {
    return authAPI.patch<T>(url, data, config);
  },
  
  delete: <T = any>(url: string, config?: any): Promise<T> => {
    return authAPI.delete<T>(url, config);
  },
};