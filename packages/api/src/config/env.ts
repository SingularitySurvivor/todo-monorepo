import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Environment variables
export const env = {
  // Server
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app',
  mongodbTestUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/todo-app-test',
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  
  // Rate Limiting
  rateLimitMax: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 100,
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : 60 * 1000, // 1 minute
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // JWT Authentication
  jwtSecret: process.env.JWT_SECRET || 'todo-app-secret-key-default',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
};