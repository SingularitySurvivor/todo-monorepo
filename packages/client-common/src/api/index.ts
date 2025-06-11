// Export API classes
export { BaseApiClient } from './base.js';
export { AuthAPI } from './authAPI.js';
export { TodoListAPI } from './todoListAPI.js';
export { TodoAPI } from './todoAPI.js';
export { UserAPI } from './userAPI.js';

// Import the classes for the factory function
import { AuthAPI } from './authAPI.js';
import { TodoListAPI } from './todoListAPI.js';
import { TodoAPI } from './todoAPI.js';
import { UserAPI } from './userAPI.js';

// Factory function to create API instances with shared base client
export const createApiClients = (baseURL?: string) => {
  return {
    auth: new AuthAPI(baseURL),
    todoList: new TodoListAPI(baseURL),
    todo: new TodoAPI(baseURL),
    user: new UserAPI(baseURL),
  };
};

// Default export for backward compatibility
export const apiClients = createApiClients();
export const { auth: authAPI, todoList: todoListAPI, todo: todoAPI, user: userAPI } = apiClients;