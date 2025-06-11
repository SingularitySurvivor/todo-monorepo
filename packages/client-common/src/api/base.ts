import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { ApiError } from '../types/index.js';

// Create axios instance with base configuration
const createApiClient = (baseURL?: string) => {
  return axios.create({
    baseURL: baseURL || 'http://localhost:3001/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Base API client class
export class BaseApiClient {
  protected client: ReturnType<typeof createApiClient>;
  private authToken: string | null = null;

  constructor(baseURL?: string) {
    this.client = createApiClient(baseURL);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Response interceptor to handle errors consistently
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // Handle 401 errors by clearing auth state
        if (error.response?.status === 401) {
          this.clearAuthToken();
          // For browser environments
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }
        
        // Return structured error
        const responseData = error.response?.data as any;
        const apiError: ApiError = {
          message: responseData?.message || error.message || 'An unexpected error occurred',
          statusCode: error.response?.status || 500,
          errors: responseData?.errors
        };
        
        return Promise.reject(apiError);
      }
    );
  }

  setBaseURL(url: string): void {
    this.client.defaults.baseURL = url;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  // Generic HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data: any = {}, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data: any = {}, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data: any = {}, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}