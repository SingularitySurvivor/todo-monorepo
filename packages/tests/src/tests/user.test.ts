// test/user.test.ts
import {
  TestDataGenerator,
  AuthHelper,
  CleanupHelper,
  AssertionHelper,
  AuthenticatedTestUser,
  ApiClient,
  User,
  ApiResponse
} from '../utils';

describe('User API', () => {
  let primaryUser: AuthenticatedTestUser;
  let secondaryUser: AuthenticatedTestUser;
  let adminUser: AuthenticatedTestUser;

  beforeAll(async () => {
    // Clean up any existing state
    ApiClient.clearAuthToken();
    
    // Create test users
    primaryUser = await AuthHelper.registerAndAuthenticateUser(
      TestDataGenerator.generateTestUser('user-primary')
    );
    
    secondaryUser = await AuthHelper.registerUser(
      TestDataGenerator.generateTestUser('user-secondary')
    );

    // Create admin user (in real app, admin would be created differently)
    const adminData = TestDataGenerator.generateTestUser('user-admin');
    adminUser = await AuthHelper.registerUser(adminData);
    
    console.log(`✅ Test users created for User API tests`);
  });

  beforeEach(async () => {
    // Set primary user as authenticated for most tests
    AuthHelper.setAuthToken(primaryUser.token);
  });

  afterEach(async () => {
    // Clean up auth state
    ApiClient.clearAuthToken();
  });

  describe('Current User Profile Management', () => {
    test('should get current user profile from auth/me endpoint', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      const response = await ApiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      
      expect(response.status).toBe('success');
      expect(response.data).toBeDefined();
      expect(response.data.user).toBeDefined();
      
      AssertionHelper.expectValidUser(response.data.user);
      expect(response.data.user.email).toBe(primaryUser.email.toLowerCase());
      expect(response.data.user.firstName).toBe(primaryUser.firstName);
      expect(response.data.user.lastName).toBe(primaryUser.lastName);
      
      console.log(`✅ Current user profile retrieved successfully`);
    });

    test('should update current user profile via users/me endpoint', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      const updateData = {
        firstName: 'Updated First',
        lastName: 'Updated Last'
      };

      const response = await ApiClient.patch<ApiResponse<{ user: User }>>('/users/me', updateData);
      
      expect(response.status).toBe('success');
      expect(response.data.user.firstName).toBe(updateData.firstName);
      expect(response.data.user.lastName).toBe(updateData.lastName);
      expect(response.data.user.email).toBe(primaryUser.email.toLowerCase());
      
      // Verify changes persist by getting current user again
      const verifyResponse = await ApiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      expect(verifyResponse.data.user.firstName).toBe(updateData.firstName);
      expect(verifyResponse.data.user.lastName).toBe(updateData.lastName);
      
      console.log(`✅ User profile updated successfully via users/me`);
    });

    test('should update current user password', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      const newPassword = 'NewPassword123!';
      const updateData = {
        password: newPassword
      };

      const response = await ApiClient.patch<ApiResponse<{ user: User }>>('/users/me', updateData);
      
      expect(response.status).toBe('success');
      expect(response.data.user).not.toHaveProperty('password'); // Password should not be returned
      
      // Verify login works with new password
      ApiClient.clearAuthToken();
      const loginResponse = await AuthHelper.loginUser({
        ...primaryUser,
        password: newPassword
      });
      
      expect(loginResponse.user.id).toBe(primaryUser.user.id);
      
      console.log(`✅ User password updated successfully`);
    });

    test('should validate required fields when updating profile', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      const invalidUpdates = [
        { firstName: '' }, // Empty first name
        { lastName: '' },  // Empty last name
        { password: '123' } // Too short password
      ];

      for (const invalidUpdate of invalidUpdates) {
        try {
          await ApiClient.patch('/users/me', invalidUpdate);
          fail(`Expected validation error for update: ${JSON.stringify(invalidUpdate)}`);
        } catch (error: any) {
          expect(error.statusCode).toBe(400);
        }
      }

      console.log(`✅ Profile update validation working correctly`);
    });

    test('should not allow updating email via users/me', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      const updateData = {
        email: 'newemail@example.com',
        firstName: 'Updated'
      };

      const response = await ApiClient.patch<ApiResponse<{ user: User }>>('/users/me', updateData);
      
      // Email should not change even if provided
      expect(response.data.user.email).toBe(primaryUser.email.toLowerCase());
      expect(response.data.user.firstName).toBe('Updated'); // Other fields should update
      
      console.log(`✅ Email update correctly ignored in users/me endpoint`);
    });
  });

  describe('User Access Control', () => {
    test('should require authentication for users/me endpoint', async () => {
      ApiClient.clearAuthToken();
      
      try {
        await ApiClient.patch('/users/me', { firstName: 'Test' });
        fail('Expected authentication error');
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
      }

      console.log(`✅ users/me endpoint correctly requires authentication`);
    });

    test('should not allow access to admin-only endpoints', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      // Test admin-only endpoints
      const adminEndpoints = [
        { method: 'GET', url: '/users' },
        { method: 'GET', url: `/users/${secondaryUser.user.id}` },
        { method: 'PATCH', url: `/users/${secondaryUser.user.id}` }
      ];

      for (const endpoint of adminEndpoints) {
        try {
          if (endpoint.method === 'GET') {
            await ApiClient.get(endpoint.url);
          } else if (endpoint.method === 'PATCH') {
            await ApiClient.patch(endpoint.url, { firstName: 'Test' });
          }
          fail(`Expected forbidden error for ${endpoint.method} ${endpoint.url}`);
        } catch (error: any) {
          expect([401, 403]).toContain(error.statusCode);
        }
      }

      console.log(`✅ Admin-only endpoints correctly protected`);
    });
  });

  describe('User Data Validation', () => {
    test('should validate user data format', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      const invalidData = [
        { firstName: 'A'.repeat(256) }, // Too long
        { lastName: 'B'.repeat(256) },  // Too long
        { password: 'short' },          // Too short
        { invalidField: 'test' }        // Unknown field (should be ignored)
      ];

      for (const data of invalidData) {
        if ((data.firstName && data.firstName.length > 255) || 
            (data.lastName && data.lastName.length > 255) || 
            data.password === 'short') {
          try {
            await ApiClient.patch('/users/me', data);
            fail(`Expected validation error for: ${JSON.stringify(data)}`);
          } catch (error: any) {
            expect(error.statusCode).toBe(400);
          }
        } else {
          // Unknown fields should be ignored, not cause errors
          const response = await ApiClient.patch<ApiResponse<{ user: User }>>('/users/me', data);
          expect(response.status).toBe('success');
        }
      }

      console.log(`✅ User data validation working correctly`);
    });

    test('should sanitize user input', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      const maliciousInput = {
        firstName: '<script>alert("xss")</script>',
        lastName: '"><img src=x onerror=alert(1)>'
      };

      const response = await ApiClient.patch<ApiResponse<{ user: User }>>('/users/me', maliciousInput);
      
      expect(response.status).toBe('success');
      // The malicious script should not be present in the response
      expect(response.data.user.firstName).not.toContain('<script>');
      expect(response.data.user.lastName).not.toContain('<img');
      
      console.log(`✅ User input sanitization working correctly`);
    });
  });

  describe('Profile Consistency', () => {
    test('should maintain profile consistency across auth and user endpoints', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      // Update via users/me
      const updateData = {
        firstName: 'Consistent',
        lastName: 'Profile'
      };

      await ApiClient.patch('/users/me', updateData);
      
      // Verify via auth/me
      const authResponse = await ApiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      expect(authResponse.data.user.firstName).toBe(updateData.firstName);
      expect(authResponse.data.user.lastName).toBe(updateData.lastName);
      
      console.log(`✅ Profile consistency maintained across endpoints`);
    });

    test('should handle concurrent profile updates gracefully', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      // Simulate concurrent updates
      const updates = [
        ApiClient.patch('/users/me', { firstName: 'Concurrent1' }),
        ApiClient.patch('/users/me', { firstName: 'Concurrent2' }),
        ApiClient.patch('/users/me', { firstName: 'Concurrent3' })
      ];

      const responses = await Promise.allSettled(updates);
      
      // At least one should succeed
      const successful = responses.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);
      
      // Final state should be consistent
      const finalResponse = await ApiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      expect(finalResponse.data.user.firstName).toMatch(/^Concurrent[123]$/);
      
      console.log(`✅ Concurrent profile updates handled gracefully`);
    });
  });

  describe('User Profile Edge Cases', () => {
    test('should handle empty update requests', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      const response = await ApiClient.patch<ApiResponse<{ user: User }>>('/users/me', {});
      
      expect(response.status).toBe('success');
      expect(response.data.user).toBeDefined();
      
      console.log(`✅ Empty update requests handled correctly`);
    });

    test('should handle partial profile updates', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      const originalResponse = await ApiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      const originalFirstName = originalResponse.data.user.firstName;
      
      // Update only last name
      const updateData = { lastName: 'OnlyLastName' };
      const response = await ApiClient.patch<ApiResponse<{ user: User }>>('/users/me', updateData);
      
      expect(response.data.user.firstName).toBe(originalFirstName); // Should remain unchanged
      expect(response.data.user.lastName).toBe('OnlyLastName');
      
      console.log(`✅ Partial profile updates working correctly`);
    });

    test('should maintain user ID and email immutability', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      const originalResponse = await ApiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      const originalId = originalResponse.data.user.id;
      const originalEmail = originalResponse.data.user.email;
      
      // Attempt to update immutable fields
      const updateData = {
        id: 'new-id',
        email: 'newemail@example.com',
        firstName: 'Updated'
      };

      const response = await ApiClient.patch<ApiResponse<{ user: User }>>('/users/me', updateData);
      
      expect(response.data.user.id).toBe(originalId);
      expect(response.data.user.email).toBe(originalEmail);
      expect(response.data.user.firstName).toBe('Updated'); // This should change
      
      console.log(`✅ User ID and email immutability maintained`);
    });
  });

  afterAll(async () => {
    // Clean up test data
    ApiClient.clearAuthToken();
    console.log(`✅ User API tests completed and cleaned up`);
  });
});