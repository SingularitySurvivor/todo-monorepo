import { TodoList, Todo, User } from './types';

export class AssertionHelper {
  static expectValidTodoList(todoList: TodoList): void {
    expect(todoList).toBeDefined();
    expect(todoList.id).toBeDefined();
    expect(todoList.name).toBeDefined();
    expect(todoList.createdAt).toBeDefined();
    expect(todoList.updatedAt).toBeDefined();
    expect(todoList.members).toBeDefined();
    expect(Array.isArray(todoList.members)).toBe(true);
    expect(typeof todoList.canEdit).toBe('boolean');
    expect(typeof todoList.canDelete).toBe('boolean');
    expect(typeof todoList.canManageMembers).toBe('boolean');
    expect(['owner', 'editor', 'viewer']).toContain(todoList.userRole);
  }

  static expectValidTodo(todo: Todo): void {
    expect(todo).toBeDefined();
    expect(todo.id).toBeDefined();
    expect(todo.name).toBeDefined();
    expect(todo.listId).toBeDefined();
    expect(todo.userId).toBeDefined();
    expect(todo.createdAt).toBeDefined();
    expect(todo.updatedAt).toBeDefined();
    expect(['not_started', 'in_progress', 'completed']).toContain(todo.status);
    if (todo.priority) {
      expect(['low', 'medium', 'high']).toContain(todo.priority);
    }
  }

  static expectTodoWithUserInfo(todo: Todo): void {
    this.expectValidTodo(todo);
    
    // Check if userId is populated with user data
    if (typeof todo.userId === 'object') {
      expect(todo.userId).toHaveProperty('id');
      expect(todo.userId).toHaveProperty('email');
      expect(todo.userId).toHaveProperty('firstName');
      expect(todo.userId).toHaveProperty('lastName');
    }
  }

  static expectValidUser(user: User): void {
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.firstName).toBeDefined();
    expect(user.lastName).toBeDefined();
  }
}