// test/todoList.test.ts
import {
  TestDataGenerator,
  AuthHelper,
  TodoListHelper,
  CleanupHelper,
  AssertionHelper,
  AuthenticatedTestUser,
  TodoList,
  TodoListResponse,
  TodoListsResponse,
  ApiClient
} from '../utils';

describe('Todo List API', () => {
  let primaryUser: AuthenticatedTestUser;
  let secondaryUser: AuthenticatedTestUser;
  let viewerUser: AuthenticatedTestUser;

  beforeAll(async () => {
    // Create test users
    primaryUser = await AuthHelper.registerAndAuthenticateUser(
      TestDataGenerator.generateTestUser('primary')
    );
    
    secondaryUser = await AuthHelper.registerUser(
      TestDataGenerator.generateTestUser('secondary')
    );
    
    viewerUser = await AuthHelper.registerUser(
      TestDataGenerator.generateTestUser('viewer')
    );

    console.log(`✅ Test users created: ${primaryUser.email}, ${secondaryUser.email}, ${viewerUser.email}`);
  });

  afterEach(async () => {
    // Clean up after each test
    await CleanupHelper.cleanupAll();
  });

  describe('Todo List CRUD Operations', () => {
    beforeEach(() => {
      AuthHelper.setAuthToken(primaryUser.token);
    });

    test('should create a new todo list with minimal data', async () => {
      const listData = TestDataGenerator.generateTodoListData({
        name: 'Minimal Test List',
        description: 'A simple test list'
      });

      const response = await ApiClient.post<TodoListResponse>('/lists', listData);

      expect(response.status).toBe('success');
      AssertionHelper.expectValidTodoList(response.data.list);
      expect(response.data.list.name).toBe(listData.name);
      expect(response.data.list.description).toBe(listData.description);
      expect(response.data.list.userRole).toBe('owner');
      expect(response.data.list.canEdit).toBe(true);
      expect(response.data.list.canDelete).toBe(true);
      expect(response.data.list.canManageMembers).toBe(true);
      expect(response.data.list.createdBy).toBe(primaryUser.user.id);

      // Verify creator is in members list as owner
      const ownerMember = response.data.list.members.find(m => m.userId === primaryUser.user.id);
      expect(ownerMember).toBeDefined();
      expect(ownerMember!.role).toBe('owner');

      CleanupHelper.trackTodoList(response.data.list.id);
      console.log(`✅ Created minimal todo list: ${response.data.list.name}`);
    });

    test('should create a todo list with full data', async () => {
      const listData = TestDataGenerator.generateTodoListData({
        name: 'Full Feature Test List',
        description: 'A comprehensive test list with all features',
        color: '#FF5733',
        icon: 'star'
      });

      const response = await ApiClient.post<TodoListResponse>('/lists', listData);

      expect(response.status).toBe('success');
      AssertionHelper.expectValidTodoList(response.data.list);
      expect(response.data.list.name).toBe(listData.name);
      expect(response.data.list.description).toBe(listData.description);
      expect(response.data.list.color).toBe(listData.color);
      expect(response.data.list.icon).toBe(listData.icon);

      CleanupHelper.trackTodoList(response.data.list.id);
      console.log(`✅ Created full feature todo list: ${response.data.list.name}`);
    });

    test('should get all todo lists for the user', async () => {
      // Create multiple lists
      const list1 = await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'List 1' })
      );
      const list2 = await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'List 2' })
      );

      CleanupHelper.trackTodoList(list1.id);
      CleanupHelper.trackTodoList(list2.id);

      const response = await ApiClient.get<TodoListsResponse>('/lists');

      expect(response.status).toBe('success');
      expect(response.data.lists).toBeDefined();
      expect(Array.isArray(response.data.lists)).toBe(true);
      expect(response.data.total).toBeGreaterThanOrEqual(2);
      expect(response.data.page).toBe(1);

      // Verify our created lists are in the response
      const listNames = response.data.lists.map(list => list.name);
      expect(listNames).toContain('List 1');
      expect(listNames).toContain('List 2');

      console.log(`✅ Retrieved ${response.data.lists.length} todo lists`);
    });

    test('should get a specific todo list by ID', async () => {
      const createdList = await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'Specific List Test' })
      );
      CleanupHelper.trackTodoList(createdList.id);

      const response = await ApiClient.get<TodoListResponse>(`/lists/${createdList.id}`);

      expect(response.status).toBe('success');
      AssertionHelper.expectValidTodoList(response.data.list);
      expect(response.data.list.id).toBe(createdList.id);
      expect(response.data.list.name).toBe('Specific List Test');

      console.log(`✅ Retrieved specific todo list: ${response.data.list.name}`);
    });

    test('should update a todo list', async () => {
      const createdList = await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'Original Name' })
      );
      CleanupHelper.trackTodoList(createdList.id);

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        color: '#00FF00',
        icon: 'updated-icon'
      };

      const response = await ApiClient.patch<TodoListResponse>(`/lists/${createdList.id}`, updateData);

      expect(response.status).toBe('success');
      expect(response.data.list.id).toBe(createdList.id);
      expect(response.data.list.name).toBe(updateData.name);
      expect(response.data.list.description).toBe(updateData.description);
      expect(response.data.list.color).toBe(updateData.color);
      expect(response.data.list.icon).toBe(updateData.icon);

      console.log(`✅ Updated todo list: ${response.data.list.name}`);
    });

    test('should delete a todo list', async () => {
      const createdList = await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'List to Delete' })
      );

      // Delete the list
      await ApiClient.delete(`/lists/${createdList.id}`);

      // Verify it's deleted
      try {
        await ApiClient.get(`/lists/${createdList.id}`);
        fail('Expected list to be deleted');
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
      }

      console.log(`✅ Deleted todo list: List to Delete`);
    });
  });

  describe('Todo List Member Management', () => {
    let testList: TodoList;

    beforeEach(async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      testList = await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'Member Management Test List' })
      );
      CleanupHelper.trackTodoList(testList.id);
    });

    test('should add a member to a todo list', async () => {
      const response = await ApiClient.post<TodoListResponse>(`/lists/${testList.id}/members`, {
        email: secondaryUser.email,
        role: 'editor'
      });

      expect(response.status).toBe('success');
      expect(response.data.list.members).toHaveLength(2); // owner + new member

      const newMember = response.data.list.members.find(m => m.userId === secondaryUser.user.id);
      expect(newMember).toBeDefined();
      expect(newMember!.role).toBe('editor');

      console.log(`✅ Added member ${secondaryUser.email} as editor`);
    });

    test('should not allow adding the same member twice', async () => {
      // Add member first time
      await TodoListHelper.addMemberToList(testList.id, secondaryUser.email, 'editor');

      // Try to add same member again
      try {
        await ApiClient.post(`/lists/${testList.id}/members`, {
          email: secondaryUser.email,
          role: 'viewer'
        });
        fail('Expected error when adding duplicate member');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('already a member');
      }

      console.log(`✅ Correctly prevented duplicate member addition`);
    });

    test('should update a member role', async () => {
      // Add member as editor
      await TodoListHelper.addMemberToList(testList.id, secondaryUser.email, 'editor');

      // Update role to viewer
      const response = await ApiClient.patch<TodoListResponse>(`/lists/${testList.id}/members`, {
        userId: secondaryUser.user.id,
        role: 'viewer'
      });

      expect(response.status).toBe('success');
      const updatedMember = response.data.list.members.find(m => m.userId === secondaryUser.user.id);
      expect(updatedMember!.role).toBe('viewer');

      console.log(`✅ Updated member role from editor to viewer`);
    });

    test('should remove a member from a todo list', async () => {
      // Add member first
      await TodoListHelper.addMemberToList(testList.id, secondaryUser.email, 'editor');

      // Remove member
      const response = await ApiClient.delete<TodoListResponse>(`/lists/${testList.id}/members/${secondaryUser.user.id}`);

      expect(response.status).toBe('success');
      const removedMember = response.data.list.members.find(m => m.userId === secondaryUser.user.id);
      expect(removedMember).toBeUndefined();

      console.log(`✅ Removed member ${secondaryUser.email}`);
    });

    test('should not allow removing the list creator', async () => {
      try {
        await ApiClient.delete(`/lists/${testList.id}/members/${primaryUser.user.id}`);
        fail('Expected error when removing creator');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('creator');
      }

      console.log(`✅ Correctly prevented creator removal`);
    });

    test('should allow member to leave a list', async () => {
      // Add secondary user as member
      await TodoListHelper.addMemberToList(testList.id, secondaryUser.email, 'editor');

      // Switch to secondary user
      AuthHelper.setAuthToken(secondaryUser.token);

      // Leave the list
      await ApiClient.post(`/lists/${testList.id}/leave`);

      // Switch back to primary user and verify member was removed
      AuthHelper.setAuthToken(primaryUser.token);
      const response = await ApiClient.get<TodoListResponse>(`/lists/${testList.id}`);
      
      const leftMember = response.data.list.members.find(m => m.userId === secondaryUser.user.id);
      expect(leftMember).toBeUndefined();

      console.log(`✅ Member successfully left the list`);
    });

    test('should not allow only owner to leave list', async () => {
      try {
        await ApiClient.post(`/lists/${testList.id}/leave`);
        fail('Expected error when only owner tries to leave');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('only owner');
      }

      console.log(`✅ Correctly prevented only owner from leaving`);
    });
  });

  describe('Todo List Permissions', () => {
    let testList: TodoList;

    beforeEach(async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      testList = await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'Permissions Test List' })
      );
      CleanupHelper.trackTodoList(testList.id);

      // Add secondary user as editor and viewer user as viewer
      await TodoListHelper.addMemberToList(testList.id, secondaryUser.email, 'editor');
      await TodoListHelper.addMemberToList(testList.id, viewerUser.email, 'viewer');
    });

    test('owner should have all permissions', async () => {
      const response = await ApiClient.get<TodoListResponse>(`/lists/${testList.id}`);
      
      expect(response.data.list.userRole).toBe('owner');
      expect(response.data.list.canEdit).toBe(true);
      expect(response.data.list.canDelete).toBe(true);
      expect(response.data.list.canManageMembers).toBe(true);

      console.log(`✅ Owner has all permissions`);
    });

    test('editor should have write permissions but not management permissions', async () => {
      AuthHelper.setAuthToken(secondaryUser.token);
      
      const response = await ApiClient.get<TodoListResponse>(`/lists/${testList.id}`);
      
      expect(response.data.list.userRole).toBe('editor');
      expect(response.data.list.canEdit).toBe(true);
      expect(response.data.list.canDelete).toBe(false);
      expect(response.data.list.canManageMembers).toBe(false);

      console.log(`✅ Editor has correct permissions`);
    });

    test('viewer should only have read permissions', async () => {
      AuthHelper.setAuthToken(viewerUser.token);
      
      const response = await ApiClient.get<TodoListResponse>(`/lists/${testList.id}`);
      
      expect(response.data.list.userRole).toBe('viewer');
      expect(response.data.list.canEdit).toBe(false);
      expect(response.data.list.canDelete).toBe(false);
      expect(response.data.list.canManageMembers).toBe(false);

      console.log(`✅ Viewer has correct permissions`);
    });

    test('editor should not be able to manage members', async () => {
      AuthHelper.setAuthToken(secondaryUser.token);
      
      try {
        await ApiClient.post(`/lists/${testList.id}/members`, {
          email: 'newuser@example.com',
          role: 'viewer'
        });
        fail('Expected permission error');
      } catch (error: any) {
        expect(error.statusCode).toBe(403);
      }

      console.log(`✅ Editor correctly denied member management`);
    });

    test('viewer should not be able to edit list', async () => {
      AuthHelper.setAuthToken(viewerUser.token);
      
      try {
        await ApiClient.patch(`/lists/${testList.id}`, {
          name: 'Unauthorized Update'
        });
        fail('Expected permission error');
      } catch (error: any) {
        expect(error.statusCode).toBe(403);
      }

      console.log(`✅ Viewer correctly denied edit permissions`);
    });

    test('non-member should not have access to private list', async () => {
      // Create a new user that's not a member
      const nonMemberUser = await AuthHelper.registerUser(
        TestDataGenerator.generateTestUser('nonmember')
      );
      AuthHelper.setAuthToken(nonMemberUser.token);
      
      try {
        await ApiClient.get(`/lists/${testList.id}`);
        fail('Expected access denied error');
      } catch (error: any) {
        expect(error.statusCode).toBe(403);
      }

      console.log(`✅ Non-member correctly denied access`);
    });
  });

  describe('Todo List Filtering and Sorting', () => {
    beforeEach(async () => {
      AuthHelper.setAuthToken(primaryUser.token);
    });


    test('should filter lists by user role', async () => {
      // Create a list and add secondary user as editor
      const testList = await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'Role Filter Test' })
      );
      CleanupHelper.trackTodoList(testList.id);

      await TodoListHelper.addMemberToList(testList.id, secondaryUser.email, 'editor');

      // Switch to secondary user and filter by role
      AuthHelper.setAuthToken(secondaryUser.token);
      const response = await ApiClient.get<TodoListsResponse>('/lists?role=editor');

      expect(response.status).toBe('success');
      response.data.lists.forEach(list => {
        expect(list.userRole).toBe('editor');
      });

      console.log(`✅ Filtered lists by role: found ${response.data.lists.length} lists where user is editor`);
    });

    test('should sort lists by name', async () => {
      // Create lists with specific names for sorting
      await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'B List' })
      );
      await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'A List' })
      );
      await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'C List' })
      );

      // Clean up will be handled by afterEach

      const response = await ApiClient.get<TodoListsResponse>('/lists?sortField=name&sortOrder=asc');

      expect(response.status).toBe('success');
      expect(response.data.lists.length).toBeGreaterThanOrEqual(3);

      // Find our test lists and verify order
      const testLists = response.data.lists.filter(list => 
        ['A List', 'B List', 'C List'].includes(list.name)
      );
      
      expect(testLists[0].name).toBe('A List');
      expect(testLists[1].name).toBe('B List');
      expect(testLists[2].name).toBe('C List');

      console.log(`✅ Sorted lists by name: ${testLists.map(l => l.name).join(', ')}`);
    });

    test('should paginate lists', async () => {
      // Create multiple lists
      for (let i = 1; i <= 5; i++) {
        const list = await TodoListHelper.createTodoList(
          TestDataGenerator.generateTodoListData({ name: `Pagination List ${i}` })
        );
        CleanupHelper.trackTodoList(list.id);
      }

      const response = await ApiClient.get<TodoListsResponse>('/lists?page=1&limit=2');

      expect(response.status).toBe('success');
      expect(response.data.lists.length).toBeLessThanOrEqual(2);
      expect(response.data.page).toBe(1);
      expect(response.data.total).toBeGreaterThanOrEqual(2);
      expect(response.data.totalPages).toBeGreaterThanOrEqual(1);

      console.log(`✅ Paginated lists: page ${response.data.page} of ${response.data.totalPages}`);
    });
  });

  describe('Todo List Validation', () => {
    beforeEach(() => {
      AuthHelper.setAuthToken(primaryUser.token);
    });

    test('should reject list creation without name', async () => {
      const listData = {
        description: 'List without name'
      };

      try {
        await ApiClient.post('/lists', listData);
        fail('Expected validation error for missing name');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain('name');
      }

      console.log(`✅ Validation correctly rejected list without name`);
    });

    test('should reject list with invalid color format', async () => {
      const listData = TestDataGenerator.generateTodoListData({
        name: 'Invalid Color List',
        color: 'invalid-color'
      });

      try {
        await ApiClient.post('/lists', listData);
        fail('Expected validation error for invalid color');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
      }

      console.log(`✅ Validation correctly rejected list with invalid color`);
    });

    test('should reject adding member with invalid email', async () => {
      const testList = await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'Invalid Email Test' })
      );
      CleanupHelper.trackTodoList(testList.id);

      try {
        await ApiClient.post(`/lists/${testList.id}/members`, {
          email: 'invalid-email',
          role: 'editor'
        });
        fail('Expected validation error for invalid email');
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
      }

      console.log(`✅ Validation correctly rejected invalid email`);
    });

    test('should reject adding member with non-existent email', async () => {
      const testList = await TodoListHelper.createTodoList(
        TestDataGenerator.generateTodoListData({ name: 'Non-existent Email Test' })
      );
      CleanupHelper.trackTodoList(testList.id);

      try {
        await ApiClient.post(`/lists/${testList.id}/members`, {
          email: 'nonexistent@example.com',
          role: 'editor'
        });
        fail('Expected error for non-existent user');
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
      }

      console.log(`✅ Correctly rejected non-existent user email`);
    });
  });

  describe('Todo List Security', () => {
    test('should not allow access without authentication', async () => {
      AuthHelper.clearAuthToken();

      try {
        await ApiClient.get('/lists');
        fail('Expected authentication error');
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
      }

      console.log(`✅ Security check passed: unauthenticated access denied`);
    });

    test('should not allow access to non-existent list', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      try {
        await ApiClient.get(`/lists/${nonExistentId}`);
        fail('Expected list not found error');
      } catch (error: any) {
        expect(error.statusCode).toBe(404);
      }

      console.log(`✅ Security check passed: cannot access non-existent lists`);
    });
  });
});
