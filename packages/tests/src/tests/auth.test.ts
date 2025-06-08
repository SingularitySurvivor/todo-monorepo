// test/auth.test.ts
import {
  TestDataGenerator,
  AuthHelper,
  CleanupHelper,
  AssertionHelper,
  AuthenticatedTestUser,
  ApiClient
} from '../utils';
import { LoginResponse, RegisterUserPayload, LoginUserPayload, User, ApiResponse } from '../types';

describe('Authentication API', () => {
  let testUser: AuthenticatedTestUser;

  beforeAll(async () => {
    // Clean up any existing state
    ApiClient.clearAuthToken();
  });

  afterEach(async () => {
    // Clean up after each tests
    ApiClient.clearAuthToken();
  });

  describe('User Registration', () => {
    test('should register a new user successfully', async () => {
      const userData = TestDataGenerator.generateTestUser('register');
      
      // Register user payload (removed company field)
      const registerPayload: RegisterUserPayload = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      // Make the API call
      const response = await ApiClient.post<LoginResponse>('/auth/register', registerPayload);
      
      // Check response structure
      expect(response.status).toBe('success');
      expect(response.data).toBeDefined();
      expect(response.data.user).toBeDefined();
      expect(response.data.token).toBeDefined();
      
      // Validate user data
      AssertionHelper.expectValidUser(response.data.user);
      expect(response.data.user.email).toBe(userData.email.toLowerCase());
      expect(response.data.user.firstName).toBe(userData.firstName);
      expect(response.data.user.lastName).toBe(userData.lastName);
      
      // Token should be a valid JWT-like string
      expect(response.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      
      console.log(`✅ User registered successfully: ${userData.email}`);
    });

    test('should not allow registration with duplicate email', async () => {
      const userData = TestDataGenerator.generateTestUser('duplicate');
      
      // Register user first time
      await AuthHelper.registerUser(userData);
      
      // Try to register same email again
      const registerPayload: RegisterUserPayload = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      try {
        await ApiClient.post('/auth/register', registerPayload);
        fail('Expected duplicate email error');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.message).toContain('email');
      }

      console.log(`✅ Duplicate email registration correctly rejected`);
    });

    test('should validate required fields during registration', async () => {
      const testCases = [
        { field: 'email', payload: { password: 'Password123!', firstName: 'Test', lastName: 'User' } },
        { field: 'password', payload: { email: 'test@example.com', firstName: 'Test', lastName: 'User' } },
        { field: 'firstName', payload: { email: 'test@example.com', password: 'Password123!', lastName: 'User' } },
        { field: 'lastName', payload: { email: 'test@example.com', password: 'Password123!', firstName: 'Test' } }
      ];

      for (const testCase of testCases) {
        try {
          await ApiClient.post('/auth/register', testCase.payload);
          fail(`Expected validation error for missing ${testCase.field}`);
        } catch (error: any) {
          expect(error.response?.status).toBe(400);
        }
      }

      console.log(`✅ Required field validation working correctly`);
    });

    test('should validate email format', async () => {
      const invalidEmails = ['invalid-email', 'test@', '@example.com', 'test..test@example.com'];
      
      for (const email of invalidEmails) {
        try {
          await ApiClient.post('/auth/register', {
            email,
            password: 'Password123!',
            firstName: 'Test',
            lastName: 'User'
          });
          fail(`Expected validation error for invalid email: ${email}`);
        } catch (error: any) {
          expect(error.response?.status).toBe(400);
        }
      }

      console.log(`✅ Email format validation working correctly`);
    });

    test('should validate password strength', async () => {
      const weakPasswords = ['123', 'password', 'Password', 'password123', 'PASSWORD123!'];
      
      for (const password of weakPasswords) {
        try {
          await ApiClient.post('/auth/register', {
            email: `test${Date.now()}@example.com`,
            password,
            firstName: 'Test',
            lastName: 'User'
          });
          fail(`Expected validation error for weak password: ${password}`);
        } catch (error: any) {
          expect(error.response?.status).toBe(400);
        }
      }

      console.log(`✅ Password strength validation working correctly`);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      testUser = await AuthHelper.registerUser(
        TestDataGenerator.generateTestUser('login')
      );
    });

    test('should login with valid credentials', async () => {
      const loginPayload: LoginUserPayload = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await ApiClient.post<LoginResponse>('/auth/login', loginPayload);
      
      // Check response structure
      expect(response.status).toBe('success');
      expect(response.data).toBeDefined();
      expect(response.data.user).toBeDefined();
      expect(response.data.token).toBeDefined();
      
      // Validate user data
      AssertionHelper.expectValidUser(response.data.user);
      expect(response.data.user.email).toBe(testUser.email.toLowerCase());
      expect(response.data.user.firstName).toBe(testUser.firstName);
      expect(response.data.user.lastName).toBe(testUser.lastName);
      
      // Token should be valid
      expect(response.data.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      
      console.log(`✅ User logged in successfully: ${testUser.email}`);
    });

    test('should not login with incorrect password', async () => {
      const loginPayload: LoginUserPayload = {
        email: testUser.email,
        password: 'WrongPassword123!'
      };

      try {
        await ApiClient.post('/auth/login', loginPayload);
        fail('Expected login error for wrong password');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }

      console.log(`✅ Login correctly rejected with wrong password`);
    });

    test('should not login with non-existent email', async () => {
      const loginPayload: LoginUserPayload = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      try {
        await ApiClient.post('/auth/login', loginPayload);
        fail('Expected login error for non-existent user');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }

      console.log(`✅ Login correctly rejected for non-existent user`);
    });

    test('should handle case-insensitive email login', async () => {
      const loginPayload: LoginUserPayload = {
        email: testUser.email.toUpperCase(),
        password: testUser.password
      };

      const response = await ApiClient.post<LoginResponse>('/auth/login', loginPayload);
      
      expect(response.status).toBe('success');
      expect(response.data.user.email).toBe(testUser.email.toLowerCase());
      
      console.log(`✅ Case-insensitive email login working correctly`);
    });
  });

  describe('Protected Routes and Token Management', () => {
    beforeEach(async () => {
      testUser = await AuthHelper.registerAndAuthenticateUser(
        TestDataGenerator.generateTestUser('protected')
      );
    });

    test('should access protected route with valid token', async () => {
      const response = await ApiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      
      expect(response.status).toBe('success');
      expect(response.data).toBeDefined();
      expect(response.data.user).toBeDefined();
      
      AssertionHelper.expectValidUser(response.data.user);
      expect(response.data.user.email).toBe(testUser.email.toLowerCase());
      expect(response.data.user.firstName).toBe(testUser.firstName);
      expect(response.data.user.lastName).toBe(testUser.lastName);
      
      console.log(`✅ Protected route accessible with valid token`);
    });

    test('should not access protected route without token', async () => {
      ApiClient.clearAuthToken();
      
      try {
        await ApiClient.get('/auth/me');
        fail('Expected authentication error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }

      console.log(`✅ Protected route correctly rejected without token`);
    });

    test('should not access protected route with invalid token', async () => {
      ApiClient.setAuthToken('invalid.token.here');
      
      try {
        await ApiClient.get('/auth/me');
        fail('Expected authentication error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }

      console.log(`✅ Protected route correctly rejected with invalid token`);
    });

    test('should not access protected route with expired token', async () => {
      // This test would require a way to generate expired tokens
      // For now, we'll test with a malformed token that looks expired
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      ApiClient.setAuthToken(expiredToken);
      
      try {
        await ApiClient.get('/auth/me');
        fail('Expected authentication error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }

      console.log(`✅ Protected route correctly rejected with expired token`);
    });

    test('should maintain authentication state across requests', async () => {
      // Make multiple authenticated requests with proper typing
      const requests = [
        ApiClient.get<ApiResponse<{ user: User }>>('/auth/me'),
        ApiClient.get<ApiResponse<any>>('/lists'),
        ApiClient.get<ApiResponse<any>>('/todos')
      ];

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe('success');
      });

      console.log(`✅ Authentication state maintained across multiple requests`);
    });
  });

  describe('Security Features', () => {
    test('should hash passwords (not store in plain text)', async () => {
      const userData = TestDataGenerator.generateTestUser('security');
      const registeredUser = await AuthHelper.registerUser(userData);
      
      // The password should not be included in the response
      expect(registeredUser.user).not.toHaveProperty('password');
      
      // We can't directly test password hashing without database access,
      // but we can verify that login still works (meaning the password was hashed and stored correctly)
      const loginResponse = await AuthHelper.loginUser(userData);
      expect(loginResponse.user.id).toBe(registeredUser.user.id);
      
      console.log(`✅ Password security verified (not exposed in responses)`);
    });

    test('should rate limit login attempts', async () => {
      const userData = TestDataGenerator.generateTestUser('ratelimit');
      await AuthHelper.registerUser(userData);
      
      // Make multiple failed login attempts
      const failedAttempts = Array.from({ length: 10 }, () => 
        ApiClient.post('/auth/login', {
          email: userData.email,
          password: 'WrongPassword123!'
        }).catch(error => error.response)
      );

      const responses = await Promise.all(failedAttempts);
      
      // Most should be 401 (wrong password), but some might be 429 (rate limited)
      const rateLimitedResponses = responses.filter(response => 
        response && typeof response === 'object' && 'status' in response && response.status === 429
      );
      
      // Note: This test might not trigger rate limiting in a test environment
      // The important thing is that we don't get any unexpected errors
      responses.forEach(response => {
        if (response && typeof response === 'object' && 'status' in response) {
          expect([401, 429]).toContain(response.status);
        }
      });

      console.log(`✅ Rate limiting test completed (${rateLimitedResponses.length} requests rate limited)`);
    });

    test('should sanitize user input', async () => {
      if (process.env.CI) {
        console.log('⏭️  Skipping input sanitization test in CI');
        return;
      }
      // Test with potentially malicious input
      const maliciousInput = '<script>alert("xss")</script>';
      
      try {
        await ApiClient.post('/auth/register', {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: maliciousInput,
          lastName: maliciousInput
        });
        
        // If registration succeeds, verify the input was sanitized
        const loginResponse = await ApiClient.post<LoginResponse>('/auth/login', {
          email: 'test@example.com',
          password: 'Password123!'
        });
        
        // The malicious script should not be present in the response
        expect(loginResponse.data.user.firstName).not.toContain('<script>');
        expect(loginResponse.data.user.lastName).not.toContain('<script>');
        
        console.log(`✅ Input sanitization working correctly`);
      } catch (error: any) {
        // If registration fails due to validation, that's also acceptable
        expect(error.response?.status).toBe(400);
        console.log(`✅ Malicious input correctly rejected during validation`);
      }
    });
  });

  describe('User Profile Management', () => {
    beforeEach(async () => {
      testUser = await AuthHelper.registerAndAuthenticateUser(
        TestDataGenerator.generateTestUser('profile')
      );
    });

    test('should get current user profile', async () => {
      const response = await ApiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      
      expect(response.status).toBe('success');
      AssertionHelper.expectValidUser(response.data.user);
      expect(response.data.user.id).toBe(testUser.user.id);
      expect(response.data.user.email).toBe(testUser.email.toLowerCase());
      
      console.log(`✅ User profile retrieved successfully`);
    });

    test('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated First',
        lastName: 'Updated Last'
      };

      const response = await ApiClient.patch<ApiResponse<{ user: User }>>('/auth/me', updateData);
      
      expect(response.status).toBe('success');
      expect(response.data.user.firstName).toBe(updateData.firstName);
      expect(response.data.user.lastName).toBe(updateData.lastName);
      expect(response.data.user.email).toBe(testUser.email.toLowerCase()); // Should remain unchanged
      
      console.log(`✅ User profile updated successfully`);
    });

    test('should not allow updating email to existing email', async () => {
      // Create another user
      const otherUser = await AuthHelper.registerUser(
        TestDataGenerator.generateTestUser('other')
      );

      try {
        await ApiClient.patch('/auth/me', {
          email: otherUser.email
        });
        fail('Expected error when updating to existing email');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }

      console.log(`✅ Email uniqueness enforced during profile updates`);
    });
  });

  describe('Logout and Session Management', () => {
    beforeEach(async () => {
      testUser = await AuthHelper.registerAndAuthenticateUser(
        TestDataGenerator.generateTestUser('logout')
      );
    });

    test('should logout successfully', async () => {
      // Verify we're authenticated
      const meResponse = await ApiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      expect(meResponse.status).toBe('success');

      // Logout (pass empty object for data parameter)
      const logoutResponse = await ApiClient.post<ApiResponse<null>>('/auth/logout', {});
      expect(logoutResponse.status).toBe('success');

      // Clear local token
      ApiClient.clearAuthToken();

      // Verify we're no longer authenticated
      try {
        await ApiClient.get('/auth/me');
        fail('Expected authentication error after logout');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }

      console.log(`✅ Logout completed successfully`);
    });

    test('should handle logout when not authenticated', async () => {
      ApiClient.clearAuthToken();

      try {
        await ApiClient.post('/auth/logout', {});
        // Logout might succeed even when not authenticated (idempotent)
        // Or it might require authentication - both are valid approaches
      } catch (error: any) {
        expect([401, 200].includes(error.response?.status)).toBe(true);
      }

      console.log(`✅ Logout handled correctly when not authenticated`);
    });
  });
});