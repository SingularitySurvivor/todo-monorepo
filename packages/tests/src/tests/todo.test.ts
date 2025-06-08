// test/todo.test.ts
import {
  TestDataGenerator,
  AuthHelper,
  TodoListHelper,
  TodoHelper,
  CleanupHelper,
  AssertionHelper,
  AuthenticatedTestUser,
  TodoList,
  Todo,
  TodoResponse,
  TodosResponse,
  TodoStatsResponse,
  ApiClient
} from '../utils';

describe('TODO API', () => {
  let primaryUser: AuthenticatedTestUser;
  let secondaryUser: AuthenticatedTestUser;
  let viewerUser: AuthenticatedTestUser;
  let testList: TodoList;
  let editableList: TodoList;
  let viewOnlyList: TodoList;

  beforeAll(async () => {
    // Create test users
    primaryUser = await AuthHelper.registerAndAuthenticateUser(
      TestDataGenerator.generateTestUser('todo-primary')
    );
    
    secondaryUser = await AuthHelper.registerUser(
      TestDataGenerator.generateTestUser('todo-secondary')
    );
    
    viewerUser = await AuthHelper.registerUser(
      TestDataGenerator.generateTestUser('todo-viewer')
    );

    console.log(`✅ Test users created for TODO tests`);
  });

  beforeEach(async () => {
    // Set primary user as authenticated
    AuthHelper.setAuthToken(primaryUser.token);

    // Create test lists with different permission levels
    testList = await TodoListHelper.createTodoList(
      TestDataGenerator.generateTodoListData({ name: 'Primary Test List' })
    );

    editableList = await TodoListHelper.createTodoList(
      TestDataGenerator.generateTodoListData({ name: 'Editable Test List' })
    );

    viewOnlyList = await TodoListHelper.createTodoList(
      TestDataGenerator.generateTodoListData({ name: 'View Only Test List' })
    );

    // Add secondary user as editor to editableList
    await TodoListHelper.addMemberToList(editableList.id, secondaryUser.email, 'editor');
    
    // Add viewer user as viewer to viewOnlyList
    await TodoListHelper.addMemberToList(viewOnlyList.id, viewerUser.email, 'viewer');

    // Track lists for cleanup
    CleanupHelper.trackTodoList(testList.id);
    CleanupHelper.trackTodoList(editableList.id);
    CleanupHelper.trackTodoList(viewOnlyList.id);
  });

  afterEach(async () => {
    await CleanupHelper.cleanupAll();
  });

  describe('TODO CRUD Operations', () => {
    test('should create a new todo with minimal data', async () => {
      const todoData = TestDataGenerator.generateTodoData(testList.id, {
        name: 'Test Todo 1',
        description: 'This is a test todo for basic creation'
      });

      const response = await ApiClient.post<TodoResponse>('/todos', todoData);

      expect(response.status).toBe('success');
      AssertionHelper.expectValidTodo(response.data.todo);
      expect(response.data.todo.name).toBe(todoData.name);
      expect(response.data.todo.description).toBe(todoData.description);
      expect(response.data.todo.status).toBe('not_started'); // default status
      expect(response.data.todo.priority).toBe('medium'); // default priority
      expect(response.data.todo.userId).toBe(primaryUser.user.id);
      expect(response.data.todo.listId).toBe(testList.id);

      CleanupHelper.trackTodo(response.data.todo.id);
      console.log(`✅ Created todo: ${response.data.todo.name} in list ${testList.name}`);
    });

    test('should create a todo with full data', async () => {
      const dueDate = TestDataGenerator.generateFutureDueDate(7);
      const todoData = TestDataGenerator.generateTodoData(testList.id, {
        name: 'Test Todo 2 - Full Data',
        description: 'This is a comprehensive test todo with all fields',
        dueDate,
        status: 'in_progress',
        priority: 'high',
        tags: ['test', 'important', 'api']
      });

      const response = await ApiClient.post<TodoResponse>('/todos', todoData);

      expect(response.status).toBe('success');
      expect(response.data.todo.name).toBe(todoData.name);
      expect(response.data.todo.description).toBe(todoData.description);
      expect(response.data.todo.status).toBe(todoData.status);
      expect(response.data.todo.priority).toBe(todoData.priority);
      expect(response.data.todo.tags).toEqual(todoData.tags);
      expect(new Date(response.data.todo.dueDate!)).toEqual(new Date(dueDate));

      CleanupHelper.trackTodo(response.data.todo.id);
      console.log(`✅ Created full todo: ${response.data.todo.name}`);
    });

    test('should get todos by list ID', async () => {
      // Create multiple todos in the test list
      const todo1 = await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { name: 'List Todo 1' })
      );
      const todo2 = await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { name: 'List Todo 2' })
      );

      CleanupHelper.trackTodo(todo1.id);
      CleanupHelper.trackTodo(todo2.id);

      const response = await ApiClient.get<TodosResponse>(`/lists/${testList.id}/todos`);

      expect(response.status).toBe('success');
      expect(response.data.todos).toBeDefined();
      expect(Array.isArray(response.data.todos)).toBe(true);
      expect(response.data.total).toBeGreaterThanOrEqual(2);

      // Verify all todos belong to the test list and have user information
      response.data.todos.forEach(todo => {
        expect(todo.listId).toBe(testList.id);
        AssertionHelper.expectTodoWithUserInfo(todo);
      });

      const todoNames = response.data.todos.map(todo => todo.name);
      expect(todoNames).toContain('List Todo 1');
      expect(todoNames).toContain('List Todo 2');

      console.log(`✅ Retrieved ${response.data.todos.length} todos from list`);
    });

    test('should get all todos across accessible lists', async () => {
      // Create todos in different lists
      const todo1 = await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { name: 'Primary List Todo' })
      );
      const todo2 = await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(editableList.id, { name: 'Editable List Todo' })
      );

      CleanupHelper.trackTodo(todo1.id);
      CleanupHelper.trackTodo(todo2.id);

      const response = await ApiClient.get<TodosResponse>('/todos');

      expect(response.status).toBe('success');
      expect(response.data.todos).toBeDefined();
      expect(response.data.total).toBeGreaterThanOrEqual(2);

      // Verify all todos have user information populated
      response.data.todos.forEach(todo => {
        AssertionHelper.expectTodoWithUserInfo(todo);
      });

      const todoNames = response.data.todos.map(todo => todo.name);
      expect(todoNames).toContain('Primary List Todo');
      expect(todoNames).toContain('Editable List Todo');

      console.log(`✅ Retrieved ${response.data.todos.length} todos across all accessible lists`);
    });

    test('should get a specific todo by ID', async () => {
      const createdTodo = await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { name: 'Specific Todo Test' })
      );
      CleanupHelper.trackTodo(createdTodo.id);

      const response = await ApiClient.get<TodoResponse>(`/todos/${createdTodo.id}`);

      expect(response.status).toBe('success');
      AssertionHelper.expectTodoWithUserInfo(response.data.todo);
      expect(response.data.todo.id).toBe(createdTodo.id);
      expect(response.data.todo.name).toBe('Specific Todo Test');

      console.log(`✅ Retrieved todo by ID: ${response.data.todo.name}`);
    });

    test('should update a todo', async () => {
      const createdTodo = await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { name: 'Todo to Update' })
      );
      CleanupHelper.trackTodo(createdTodo.id);

      const updateData = {
        name: 'Updated Todo Name',
        status: 'completed' as const,
        priority: 'low' as const,
        tags: ['updated', 'completed']
      };

      const response = await ApiClient.patch<TodoResponse>(`/todos/${createdTodo.id}`, updateData);

      expect(response.status).toBe('success');
      expect(response.data.todo.id).toBe(createdTodo.id);
      expect(response.data.todo.name).toBe(updateData.name);
      expect(response.data.todo.status).toBe(updateData.status);
      expect(response.data.todo.priority).toBe(updateData.priority);
      expect(response.data.todo.tags).toEqual(updateData.tags);

      console.log(`✅ Updated todo: ${response.data.todo.name}`);
    });

    test('should delete a todo', async () => {
      const createdTodo = await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { name: 'Todo to Delete' })
      );

      // Delete the todo
      await ApiClient.delete(`/todos/${createdTodo.id}`);

      // Verify it's deleted by trying to get it (should fail)
      try {
        await ApiClient.get(`/todos/${createdTodo.id}`);
        fail('Expected todo to be deleted');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }

      console.log(`✅ Deleted todo: Todo to Delete`);
    });
  });

  describe('TODO Permissions and Access Control', () => {
    test('should allow editor to create todos in editable list', async () => {
      AuthHelper.setAuthToken(secondaryUser.token);

      const todoData = TestDataGenerator.generateTodoData(editableList.id, {
        name: 'Editor Created Todo'
      });

      const response = await ApiClient.post<TodoResponse>('/todos', todoData);

      expect(response.status).toBe('success');
      expect(response.data.todo.name).toBe(todoData.name);
      expect(response.data.todo.listId).toBe(editableList.id);
      expect(response.data.todo.userId).toBe(secondaryUser.user.id);

      CleanupHelper.trackTodo(response.data.todo.id);
      console.log(`✅ Editor successfully created todo in editable list`);
    });

    test('should not allow viewer to create todos in view-only list', async () => {
      AuthHelper.setAuthToken(viewerUser.token);

      const todoData = TestDataGenerator.generateTodoData(viewOnlyList.id, {
        name: 'Unauthorized Todo'
      });

      try {
        await ApiClient.post('/todos', todoData);
        fail('Expected permission error');
      } catch (error: any) {
        expect(error.response?.status).toBe(403);
      }

      console.log(`✅ Viewer correctly denied todo creation in view-only list`);
    });

    test('should not allow creating todos in non-accessible list', async () => {
      // Switch to secondary user (not a member of testList)
      AuthHelper.setAuthToken(secondaryUser.token);

      const todoData = TestDataGenerator.generateTodoData(testList.id, {
        name: 'Unauthorized Todo'
      });

      try {
        await ApiClient.post('/todos', todoData);
        fail('Expected permission error');
      } catch (error: any) {
        expect(error.response?.status).toBe(403);
      }

      console.log(`✅ Non-member correctly denied todo creation`);
    });

    test('should allow viewer to read todos but not edit them', async () => {
      // Create a todo as primary user
      AuthHelper.setAuthToken(primaryUser.token);
      const createdTodo = await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(viewOnlyList.id, { name: 'Viewer Read Test' })
      );
      CleanupHelper.trackTodo(createdTodo.id);

      // Switch to viewer user
      AuthHelper.setAuthToken(viewerUser.token);

      // Should be able to read
      const readResponse = await ApiClient.get<TodoResponse>(`/todos/${createdTodo.id}`);
      expect(readResponse.status).toBe('success');
      expect(readResponse.data.todo.name).toBe('Viewer Read Test');

      // Should not be able to edit
      try {
        await ApiClient.patch(`/todos/${createdTodo.id}`, { name: 'Unauthorized Update' });
        fail('Expected permission error');
      } catch (error: any) {
        expect(error.response?.status).toBe(403);
      }

      console.log(`✅ Viewer can read but cannot edit todos`);
    });

    test('should not show todos from inaccessible lists', async () => {
      // Create todo as primary user in testList
      const createdTodo = await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { name: 'Private Todo' })
      );
      CleanupHelper.trackTodo(createdTodo.id);

      // Switch to secondary user (not a member of testList)
      AuthHelper.setAuthToken(secondaryUser.token);

      // Get all todos - should not include the private todo
      const response = await ApiClient.get<TodosResponse>('/todos');
      
      const todoNames = response.data.todos.map(todo => todo.name);
      expect(todoNames).not.toContain('Private Todo');

      console.log(`✅ Private todos correctly hidden from non-members`);
    });
  });

  describe('TODO Filtering and Sorting', () => {
    beforeEach(async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      
      // Create todos with different attributes for filtering/sorting tests
      await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, {
          name: 'High Priority Todo',
          status: 'not_started',
          priority: 'high',
          tags: ['urgent', 'important']
        })
      );

      await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, {
          name: 'Completed Todo',
          status: 'completed',
          priority: 'low',
          tags: ['done']
        })
      );

      await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, {
          name: 'In Progress Todo',
          status: 'in_progress',
          priority: 'medium',
          tags: ['work']
        })
      );
    });

    test('should filter todos by status', async () => {
      const response = await ApiClient.get<TodosResponse>(`/lists/${testList.id}/todos?status=completed`);

      expect(response.status).toBe('success');
      expect(response.data.todos.length).toBeGreaterThan(0);
      
      response.data.todos.forEach(todo => {
        expect(todo.status).toBe('completed');
      });

      console.log(`✅ Filtered todos by status: found ${response.data.todos.length} completed todos`);
    });

    test('should filter todos by priority', async () => {
      const response = await ApiClient.get<TodosResponse>(`/lists/${testList.id}/todos?priority=high`);

      expect(response.status).toBe('success');
      
      response.data.todos.forEach(todo => {
        expect(todo.priority).toBe('high');
      });

      console.log(`✅ Filtered todos by priority: found ${response.data.todos.length} high priority todos`);
    });

    test('should filter todos by tags', async () => {
      const response = await ApiClient.get<TodosResponse>(`/lists/${testList.id}/todos?tags=urgent`);

      expect(response.status).toBe('success');
      
      response.data.todos.forEach(todo => {
        expect(todo.tags).toContain('urgent');
      });

      console.log(`✅ Filtered todos by tags: found ${response.data.todos.length} urgent todos`);
    });

    test('should filter todos by due date range', async () => {
      // Create a todo with future due date
      const futureDate = TestDataGenerator.generateFutureDueDate(5);
      await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, {
          name: 'Future Due Todo',
          dueDate: futureDate
        })
      );

      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await ApiClient.get<TodosResponse>(
        `/lists/${testList.id}/todos?dueDateFrom=${today}&dueDateTo=${nextWeek}`
      );

      expect(response.status).toBe('success');
      
      response.data.todos.forEach(todo => {
        if (todo.dueDate) {
          const dueDate = new Date(todo.dueDate);
          expect(dueDate.getTime()).toBeGreaterThanOrEqual(new Date(today).getTime());
          expect(dueDate.getTime()).toBeLessThanOrEqual(new Date(nextWeek).getTime());
        }
      });

      console.log(`✅ Filtered todos by due date range: found ${response.data.todos.length} todos`);
    });

    test('should sort todos by creation date', async () => {
      const response = await ApiClient.get<TodosResponse>(
        `/lists/${testList.id}/todos?sortField=createdAt&sortOrder=asc`
      );

      expect(response.status).toBe('success');
      
      if (response.data.todos.length > 1) {
        for (let i = 1; i < response.data.todos.length; i++) {
          const prevDate = new Date(response.data.todos[i - 1].createdAt);
          const currentDate = new Date(response.data.todos[i].createdAt);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
        }
      }

      console.log(`✅ Sorted todos by creation date: ${response.data.todos.length} todos`);
    });

    test('should sort todos by name', async () => {
      const response = await ApiClient.get<TodosResponse>(
        `/lists/${testList.id}/todos?sortField=name&sortOrder=asc`
      );

      expect(response.status).toBe('success');
      
      if (response.data.todos.length > 1) {
        for (let i = 1; i < response.data.todos.length; i++) {
          expect(response.data.todos[i].name >= response.data.todos[i - 1].name).toBe(true);
        }
      }

      console.log(`✅ Sorted todos by name: ${response.data.todos.map(t => t.name).join(', ')}`);
    });

    test('should paginate todos', async () => {
      const response = await ApiClient.get<TodosResponse>(`/lists/${testList.id}/todos?page=1&limit=2`);

      expect(response.status).toBe('success');
      expect(response.data.todos.length).toBeLessThanOrEqual(2);
      expect(response.data.page).toBe(1);
      expect(response.data.total).toBeGreaterThanOrEqual(3);

      console.log(`✅ Paginated todos: page ${response.data.page} of ${response.data.totalPages}`);
    });
  });

  describe('TODO Statistics', () => {
    beforeEach(async () => {
      AuthHelper.setAuthToken(primaryUser.token);
    });

    test('should get todo statistics for a specific list', async () => {
      // Create todos with different statuses and priorities
      await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { status: 'completed', priority: 'high' })
      );
      await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { status: 'in_progress', priority: 'medium' })
      );
      await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { status: 'not_started', priority: 'low' })
      );

      const response = await ApiClient.get<TodoStatsResponse>(`/lists/${testList.id}/todos/stats`);

      expect(response.status).toBe('success');
      expect(response.data.stats).toBeDefined();
      expect(response.data.stats.total).toBeGreaterThanOrEqual(3);
      expect(response.data.stats.byStatus).toBeDefined();
      expect(response.data.stats.byPriority).toBeDefined();

      // Verify we have at least one of each status
      expect(response.data.stats.byStatus.completed).toBeGreaterThanOrEqual(1);
      expect(response.data.stats.byStatus.in_progress).toBeGreaterThanOrEqual(1);
      expect(response.data.stats.byStatus.not_started).toBeGreaterThanOrEqual(1);

      console.log(`✅ Retrieved list stats: ${response.data.stats.total} total todos`);
      console.log(`   Status breakdown:`, response.data.stats.byStatus);
    });

    test('should get todo statistics across all accessible lists', async () => {
      // Create todos in different lists
      await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { status: 'completed' })
      );
      await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(editableList.id, { status: 'in_progress' })
      );

      const response = await ApiClient.get<TodoStatsResponse>('/todos/stats');

      expect(response.status).toBe('success');
      expect(response.data.stats).toBeDefined();
      expect(response.data.stats.total).toBeGreaterThanOrEqual(2);
      expect(response.data.stats.byStatus).toBeDefined();
      expect(response.data.stats.byPriority).toBeDefined();

      console.log(`✅ Retrieved global stats: ${response.data.stats.total} total todos`);
      console.log(`   Status breakdown:`, response.data.stats.byStatus);
    });
  });

  describe('TODO Validation', () => {
    beforeEach(() => {
      AuthHelper.setAuthToken(primaryUser.token);
    });

    test('should reject todo creation without name', async () => {
      const todoData = {
        listId: testList.id,
        description: 'Todo without name'
      };

      try {
        await ApiClient.post('/todos', todoData);
        fail('Expected validation error for missing name');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.message).toContain('name');
      }

      console.log(`✅ Validation correctly rejected todo without name`);
    });

    test('should reject todo creation without listId', async () => {
      const todoData = {
        name: 'Todo without list',
        description: 'This should fail'
      };

      try {
        await ApiClient.post('/todos', todoData);
        fail('Expected validation error for missing listId');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.message).toContain('list');
      }

      console.log(`✅ Validation correctly rejected todo without listId`);
    });

    test('should reject todo with past due date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const todoData = TestDataGenerator.generateTodoData(testList.id, {
        name: 'Past Due Todo',
        dueDate: pastDate.toISOString()
      });

      try {
        await ApiClient.post('/todos', todoData);
        fail('Expected validation error for past due date');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.message).toContain('future');
      }

      console.log(`✅ Validation correctly rejected todo with past due date`);
    });

    test('should reject todo with invalid status', async () => {
      const todoData = {
        name: 'Invalid Status Todo',
        listId: testList.id,
        status: 'invalid_status'
      };

      try {
        await ApiClient.post('/todos', todoData);
        fail('Expected validation error for invalid status');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }

      console.log(`✅ Validation correctly rejected todo with invalid status`);
    });

    test('should reject todo with invalid priority', async () => {
      const todoData = {
        name: 'Invalid Priority Todo',
        listId: testList.id,
        priority: 'super_urgent'
      };

      try {
        await ApiClient.post('/todos', todoData);
        fail('Expected validation error for invalid priority');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }

      console.log(`✅ Validation correctly rejected todo with invalid priority`);
    });
  });

  describe('TODO Security', () => {
    test('should not allow access to todos without authentication', async () => {
      AuthHelper.clearAuthToken();

      try {
        await ApiClient.get('/todos');
        fail('Expected authentication error');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }

      console.log(`✅ Security check passed: unauthenticated access denied`);
    });

    test('should not allow access to non-existent todos', async () => {
      AuthHelper.setAuthToken(primaryUser.token);
      const nonExistentId = '507f1f77bcf86cd799439011';

      try {
        await ApiClient.get(`/todos/${nonExistentId}`);
        fail('Expected todo not found error');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }

      console.log(`✅ Security check passed: cannot access non-existent todos`);
    });

    test('should not allow accessing todos from inaccessible lists', async () => {
      // Create todo as primary user
      const createdTodo = await TodoHelper.createTodo(
        TestDataGenerator.generateTodoData(testList.id, { name: 'Private Todo' })
      );
      CleanupHelper.trackTodo(createdTodo.id);

      // Try to access as secondary user (not a member)
      AuthHelper.setAuthToken(secondaryUser.token);

      try {
        await ApiClient.get(`/todos/${createdTodo.id}`);
        fail('Expected access denied error');
      } catch (error: any) {
        expect(error.response?.status).toBe(403);
      }

      console.log(`✅ Security check passed: cannot access todos from inaccessible lists`);
    });
  });
});
