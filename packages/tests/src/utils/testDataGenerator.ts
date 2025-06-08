import { TestUser } from './types';

export class TestDataGenerator {
  private static counter = 0;

  static generateUniqueId(): string {
    return `${Date.now()}_${++this.counter}`;
  }

  static generateTestUser(prefix = 'test'): TestUser {
    const uniqueId = this.generateUniqueId();
    return {
      email: `${prefix}.user.${uniqueId}@example.com`,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    };
  }

  static generateTestUsers(count: number, prefix = 'test'): TestUser[] {
    return Array.from({ length: count }, (_, i) => 
      this.generateTestUser(`${prefix}${i + 1}`)
    );
  }

  static generateTodoListData(overrides: Partial<any> = {}) {
    const uniqueId = this.generateUniqueId();
    return {
      name: `Test List ${uniqueId}`,
      description: `Test todo list created at ${new Date().toISOString()}`,
      color: '#3B82F6',
      icon: 'list',
      ...overrides
    };
  }

  static generateTodoData(listId: string, overrides: Partial<any> = {}) {
    const uniqueId = this.generateUniqueId();
    return {
      name: `Test Todo ${uniqueId}`,
      description: `Test todo created at ${new Date().toISOString()}`,
      listId,
      status: 'not_started' as const,
      priority: 'medium' as const,
      tags: ['test'],
      ...overrides
    };
  }

  static generateFutureDueDate(daysFromNow = 7): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
  }
}