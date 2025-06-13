// src/services/authService.ts
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { User } from '../models';
import { ApiError, UserTransformer, MongoValidator } from '../utils';
import { config } from '../config';
import { IUser, IUserSafe, UserRegisterDto, UserLoginDto, AuthTokenPayload } from '../types';
import type { StringValue } from 'ms';

/**
 * Generate JWT token
 */
const generateToken = (id: string, email: string, role: string): string => {
  const payload: AuthTokenPayload = {
    id,
    email,
    role,
  };

  return jwt.sign(
    payload,
    config.jwt.secret!,
    { expiresIn: config.jwt.expiresIn as StringValue }
  );
};

/**
 * Register a new user
 */
export const registerUser = async (userData: UserRegisterDto): Promise<{ user: any; token: string }> => {
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email: userData.email.toLowerCase() });
    if (userExists) {
      throw ApiError.badRequest('User with this email already exists');
    }

    // Create the user
    const user = new User({
      email: userData.email.toLowerCase(),
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'user', // Default role
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Convert to safe user object (remove password, convert _id to id)
    const safeUser = UserTransformer.toSafeUser(user);

    return {
      user: safeUser,
      token,
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (
  loginData: UserLoginDto
): Promise<{ user: any; token: string }> => {
  try {
    // Check if user exists
    const user = await User.findOne({ email: loginData.email.toLowerCase() }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.unauthorized('Your account has been deactivated');
    }

    // Check if password matches
    const isMatch = await user.comparePassword(loginData.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Convert the Mongoose document to a plain object and restructure to safe format
    const safeUser = UserTransformer.toSafeUser(user);

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Update last login directly in the database without triggering pre-save hooks
    await User.findByIdAndUpdate(
      user._id,
      { lastLogin: new Date() },
      { new: true, runValidators: false }
    );

    return {
      user: safeUser,
      token,
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUser = async (
  userId: string,
  updateData: { firstName?: string; lastName?: string; email?: string }
): Promise<any> => {
  try {
    MongoValidator.validateObjectIds(userId);

    // If email is being updated, check if it already exists
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        throw ApiError.badRequest('User with this email already exists');
      }
      
      // Convert email to lowercase
      updateData.email = updateData.email.toLowerCase();
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw ApiError.notFound('User not found');
    }

    // Convert to safe user object
    const safeUser = UserTransformer.toSafeUser(updatedUser);

    return safeUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Update user password
 */
export const updatePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<any> => {
  try {
    MongoValidator.validateObjectIds(userId);

    // Find the user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Update with new password
    user.password = newPassword;
    await user.save();

    // Convert to safe user object
    const safeUser = UserTransformer.toSafeUser(user);

    return safeUser;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<any | null> => {
  try {
    MongoValidator.validateObjectIds(userId);

    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    // Convert to safe user object
    const safeUser = UserTransformer.toSafeUser(user);

    return safeUser;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};