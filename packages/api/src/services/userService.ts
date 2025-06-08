import { Types } from 'mongoose';
import { User } from '../models';
import { ApiError, UserTransformer, MongoValidator } from '../utils';
import { IUser, IUserSafe, UpdateUserDto } from '../types';

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    return await User.find().select('-password');
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<IUser> => {
  MongoValidator.validateObjectIds(id);

  const user = await User.findById(id).select('-password');
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  
  return user;
};

/**
 * Update user
 */
export const updateUser = async (
  id: string,
  updateData: UpdateUserDto
): Promise<any> => {
  MongoValidator.validateObjectIds(id);
  
  const user = await User.findById(id);
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  
  // Update fields if provided
  if (updateData.firstName !== undefined) user.firstName = updateData.firstName;
  if (updateData.lastName !== undefined) user.lastName = updateData.lastName;
  if (updateData.password !== undefined) user.password = updateData.password;
  if (updateData.role !== undefined) user.role = updateData.role;
  if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
  
  await user.save();
  
  // Convert to safe user object
  const safeUser = UserTransformer.toSafeUser(user);
  
  return safeUser;
};
