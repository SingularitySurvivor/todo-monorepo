import mongoose, { Schema } from 'mongoose';
import { ITodoList, ListRole } from '../types/todoList';

const listMemberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(ListRole),
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { _id: false });

const todoListSchema = new Schema<ITodoList>(
  {
    name: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
      maxlength: [100, 'List name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    members: [listMemberSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'],
    },
    icon: {
      type: String,
      maxlength: [50, 'Icon name cannot exceed 50 characters'],
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
todoListSchema.index({ createdBy: 1, isArchived: 1 });
todoListSchema.index({ 'members.userId': 1 });
todoListSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure creator is always an owner
todoListSchema.pre('save', function(next) {
  if (this.isNew) {
    // Check if creator is already in members array
    const creatorMember = this.members.find(
      member => member.userId.toString() === this.createdBy.toString()
    );
    
    if (!creatorMember) {
      this.members.push({
        userId: this.createdBy,
        role: ListRole.OWNER,
        joinedAt: new Date(),
      });
    } else if (creatorMember.role !== ListRole.OWNER) {
      creatorMember.role = ListRole.OWNER;
    }
  }
  next();
});

// Instance methods
todoListSchema.methods.getUserRole = function(userId: string): ListRole | null {
  const member = this.members.find(
    (member: any) => {
      // Handle both populated and non-populated userId
      const memberUserId = member.userId._id || member.userId;
      return memberUserId.toString() === userId.toString();
    }
  );
  return member ? member.role : null;
};

todoListSchema.methods.hasPermission = function(
  userId: string, 
  action: 'read' | 'write' | 'delete' | 'manage'
): boolean {
  const role = this.getUserRole(userId);
  if (!role) return false;

  switch (action) {
    case 'read':
      return [ListRole.OWNER, ListRole.EDITOR, ListRole.VIEWER].includes(role);
    case 'write':
      return [ListRole.OWNER, ListRole.EDITOR].includes(role);
    case 'delete':
    case 'manage':
      return role === ListRole.OWNER;
    default:
      return false;
  }
};

todoListSchema.methods.addMember = function(userId: string, role: ListRole, invitedBy?: string) {
  // Remove existing member if any
  this.members = this.members.filter(
    (member: any) => member.userId.toString() !== userId.toString()
  );
  
  // Add new member
  this.members.push({
    userId: new mongoose.Types.ObjectId(userId),
    role,
    joinedAt: new Date(),
    invitedBy: invitedBy ? new mongoose.Types.ObjectId(invitedBy) : undefined,
  });
};

todoListSchema.methods.removeMember = function(userId: string) {
  this.members = this.members.filter(
    (member: any) => member.userId.toString() !== userId.toString()
  );
};

todoListSchema.methods.updateMemberRole = function(userId: string, newRole: ListRole) {
  const member = this.members.find(
    (member: any) => member.userId.toString() === userId.toString()
  );
  if (member) {
    member.role = newRole;
  }
};

const TodoList = mongoose.model<ITodoList>('TodoList', todoListSchema);

export default TodoList;