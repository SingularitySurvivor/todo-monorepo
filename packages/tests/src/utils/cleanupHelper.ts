import { TodoHelper } from './todoHelper';
import { TodoListHelper } from './todoListHelper';

export class CleanupHelper {
  private static createdTodoLists: string[] = [];
  private static createdTodos: string[] = [];

  static trackTodoList(listId: string): void {
    this.createdTodoLists.push(listId);
  }

  static trackTodo(todoId: string): void {
    this.createdTodos.push(todoId);
  }

  static async cleanupTodos(): Promise<void> {
    for (const todoId of this.createdTodos) {
      try {
        await TodoHelper.deleteTodo(todoId);
      } catch (error) {
        console.log(`Failed to cleanup todo ${todoId}:`, error);
      }
    }
    this.createdTodos = [];
  }

  static async cleanupTodoLists(): Promise<void> {
    for (const listId of this.createdTodoLists) {
      try {
        await TodoListHelper.deleteTodoList(listId);
      } catch (error) {
        console.log(`Failed to cleanup todo list ${listId}:`, error);
      }
    }
    this.createdTodoLists = [];
  }

  static async cleanupAll(): Promise<void> {
    await this.cleanupTodos();
    await this.cleanupTodoLists();
  }
}