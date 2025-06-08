// test/utils/api.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Add state for token storage
let authToken: string | null = null;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token when available
api.interceptors.request.use(
  (config) => {
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhance error with response data for better debugging
    if (error.response) {
      error.message = error.response.data?.message || error.message;
    }
    return Promise.reject(error);
  }
);

export const ApiClient = {
  /**
   * Set base URL for requests
   */
  setBaseURL(url: string): void {
    api.defaults.baseURL = url;
  },

  /**
   * Set authentication token for future requests
   */
  setAuthToken(token: string): void {
    authToken = token;
  },

  /**
   * Get current authentication token
   */
  getAuthToken(): string | null {
    return authToken;
  },

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    authToken = null;
  },

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.get(url, config);
      return response.data;
    } catch (error: any) {
      console.error(`GET request failed: ${url}`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data: any = {}, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.post(url, data, config);
      return response.data;
    } catch (error: any) {
      console.error(`POST request failed: ${url}`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data: any = {}, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.put(url, data, config);
      return response.data;
    } catch (error: any) {
      console.error(`PUT request failed: ${url}`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Make a PATCH request
   */
  async patch<T = any>(url: string, data: any = {}, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.patch(url, data, config);
      return response.data;
    } catch (error: any) {
      console.error(`PATCH request failed: ${url}`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.delete(url, config);
      return response.data;
    } catch (error: any) {
      console.error(`DELETE request failed: ${url}`, error.response?.data || error.message);
      throw error;
    }
  },
};