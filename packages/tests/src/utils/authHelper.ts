import { ApiClient } from './api';
import { TestUser, AuthenticatedTestUser, LoginResponse, RegisterUserPayload } from './types';
import { TestDataGenerator } from './testDataGenerator';

export class AuthHelper {
  static async registerUser(userData: TestUser): Promise<AuthenticatedTestUser> {
    const registerPayload: RegisterUserPayload = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName
    };

    const response = await ApiClient.post<LoginResponse>('/auth/register', registerPayload);
    
    if (response.status !== 'success') {
      throw new Error(`Registration failed: ${JSON.stringify(response)}`);
    }

    return {
      ...userData,
      user: response.data.user,
      token: response.data.token
    };
  }

  static async loginUser(userData: TestUser): Promise<AuthenticatedTestUser> {
    const loginPayload = {
      email: userData.email,
      password: userData.password
    };

    const response = await ApiClient.post<LoginResponse>('/auth/login', loginPayload);
    
    if (response.status !== 'success') {
      throw new Error(`Login failed: ${JSON.stringify(response)}`);
    }

    return {
      ...userData,
      user: response.data.user,
      token: response.data.token
    };
  }

  static async registerAndAuthenticateUser(userData?: TestUser): Promise<AuthenticatedTestUser> {
    const testUser = userData || TestDataGenerator.generateTestUser();
    const authenticatedUser = await this.registerUser(testUser);
    ApiClient.setAuthToken(authenticatedUser.token);
    return authenticatedUser;
  }

  static setAuthToken(token: string): void {
    ApiClient.setAuthToken(token);
  }

  static clearAuthToken(): void {
    ApiClient.clearAuthToken();
  }
}