// Import API clients from client-common
import { createApiClients } from '@todo-app/client-common';

// Create API clients with web environment configuration
const apiClients = createApiClients(process.env.REACT_APP_API_URL || 'http://localhost:3001/api');

// Set up browser-specific authentication handling
const setupBrowserAuth = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    apiClients.auth.setAuthToken(token);
    apiClients.todoList.setAuthToken(token);
    apiClients.todo.setAuthToken(token);
    apiClients.user.setAuthToken(token);
  }
};

// Initialize auth on load
setupBrowserAuth();

// Export the API clients
export const { auth: authAPI, todoList: todoListAPI, todo: todoAPI, user: userAPI } = apiClients;

// Export default for backward compatibility
export default {
  setAuthToken: (token: string) => {
    localStorage.setItem('authToken', token);
    authAPI.setAuthToken(token);
    todoListAPI.setAuthToken(token);
    todoAPI.setAuthToken(token);
    userAPI.setAuthToken(token);
  },
  clearAuthToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authAPI.clearAuthToken();
    todoListAPI.clearAuthToken();
    todoAPI.clearAuthToken();
    userAPI.clearAuthToken();
  }
};