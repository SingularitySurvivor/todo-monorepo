import mongoose, { Schema } from 'mongoose';
import { ITodo, TodoStatus, TodoPriority } from '../types/todo';

const todoSchema = new Schema<ITodo>(
  {
    name: {
      type: String,
      required: [true, 'Todo name is required'],
      trim: true,
      maxlength: [200, 'Todo name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function(value: Date) {
          return !value || value > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    status: {
      type: String,
      enum: Object.values(TodoStatus),
      default: TodoStatus.NOT_STARTED,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(TodoPriority),
      default: TodoPriority.MEDIUM,
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters'],
    }],
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    listId: {
      type: Schema.Types.ObjectId,
      ref: 'TodoList',
      required: [true, 'List ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for efficient querying
todoSchema.index({ listId: 1, status: 1, priority: 1, dueDate: 1 });
todoSchema.index({ listId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, status: 1, createdAt: -1 });

const Todo = mongoose.model<ITodo>('Todo', todoSchema);

export default Todo;